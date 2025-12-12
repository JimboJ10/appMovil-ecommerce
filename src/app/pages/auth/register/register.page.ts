import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class RegisterPage implements OnInit {
  formularioRegistro: FormGroup;
  mostrarPassword: boolean = false;
  mostrarConfirmarPassword: boolean = false;
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.formularioRegistro = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.validadorSoloLetras()
      ]],
      surname: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.validadorSoloLetras()
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{9,15}$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.validadorPasswordSeguro()
      ]],
      confirmarPassword: ['', [Validators.required]],
      aceptarTerminos: [false, [Validators.requiredTrue]]
    }, {
      validators: this.validadorPasswordsCoinciden('password', 'confirmarPassword')
    });
  }

  ngOnInit() {}

  // Validador personalizado: Solo letras y espacios
  validadorSoloLetras() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      return regex.test(control.value) ? null : { soloLetras: true };
    };
  }

  // Validador personalizado: Password seguro
  validadorPasswordSeguro() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const valor = control.value;
      const tieneMayuscula = /[A-Z]/.test(valor);
      const tieneMinuscula = /[a-z]/.test(valor);
      const tieneNumero = /[0-9]/.test(valor);
      const tieneCaracterEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(valor);

      const passwordSeguro = tieneMayuscula && tieneMinuscula && tieneNumero && tieneCaracterEspecial;

      return passwordSeguro ? null : { 
        passwordDebil: {
          tieneMayuscula,
          tieneMinuscula,
          tieneNumero,
          tieneCaracterEspecial
        }
      };
    };
  }

  // Validador personalizado: Passwords coinciden
  validadorPasswordsCoinciden(passwordKey: string, confirmarPasswordKey: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordKey);
      const confirmarPassword = formGroup.get(confirmarPasswordKey);

      if (!password || !confirmarPassword) return null;

      if (confirmarPassword.errors && !confirmarPassword.errors['passwordsNoCoinciden']) {
        return null;
      }

      if (password.value !== confirmarPassword.value) {
        confirmarPassword.setErrors({ passwordsNoCoinciden: true });
        return { passwordsNoCoinciden: true };
      } else {
        confirmarPassword.setErrors(null);
        return null;
      }
    };
  }

  obtenerMensajeError(nombreCampo: string): string {
    const campo = this.formularioRegistro.get(nombreCampo);
    if (!campo || !campo.touched) return '';

    if (campo.hasError('required')) {
      return 'Este campo es requerido';
    }

    switch (nombreCampo) {
      case 'name':
      case 'surname':
        if (campo.hasError('minlength')) return 'Debe tener al menos 2 caracteres';
        if (campo.hasError('maxlength')) return 'No puede exceder 50 caracteres';
        if (campo.hasError('soloLetras')) return 'Solo se permiten letras';
        break;

      case 'email':
        if (campo.hasError('email') || campo.hasError('pattern')) {
          return 'Ingresa un correo electrónico válido';
        }
        break;

      case 'phone':
        if (campo.hasError('pattern')) {
          return 'El teléfono debe tener entre 9 y 15 dígitos';
        }
        break;

      case 'password':
        if (campo.hasError('minlength')) {
          return 'La contraseña debe tener al menos 8 caracteres';
        }
        if (campo.hasError('passwordDebil')) {
          return 'La contraseña debe incluir mayúsculas, minúsculas, números y símbolos';
        }
        break;

      case 'confirmarPassword':
        if (campo.hasError('passwordsNoCoinciden')) {
          return 'Las contraseñas no coinciden';
        }
        break;
    }

    return '';
  }

  campoEsInvalido(nombreCampo: string): boolean {
    const campo = this.formularioRegistro.get(nombreCampo);
    return !!(campo && campo.invalid && campo.touched);
  }

  obtenerRequisitosPassword() {
    const password = this.formularioRegistro.get('password');
    const errores = password?.errors?.['passwordDebil'];

    if (!errores) return null;

    return {
      tieneMayuscula: errores.tieneMayuscula,
      tieneMinuscula: errores.tieneMinuscula,
      tieneNumero: errores.tieneNumero,
      tieneCaracterEspecial: errores.tieneCaracterEspecial
    };
  }

  async registrarse() {
    if (this.formularioRegistro.invalid) {
      Object.keys(this.formularioRegistro.controls).forEach(key => {
        this.formularioRegistro.get(key)?.markAsTouched();
      });
      await this.mostrarToast('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Creando tu cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    this.cargando = true;

    try {
      const datosUsuario = {
        rol: 'cliente',
        name: this.formularioRegistro.value.name.trim(),
        surname: this.formularioRegistro.value.surname.trim(),
        email: this.formularioRegistro.value.email.toLowerCase().trim(),
        phone: this.formularioRegistro.value.phone.trim(),
        password: this.formularioRegistro.value.password,
        state: 1
      };

      await this.authService.register(datosUsuario).toPromise();
      
      await loading.dismiss();
      await this.mostrarToast('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión', 'success');
      this.router.navigate(['/auth/login']);
    } catch (error: any) {
      await loading.dismiss();
      const mensaje = error?.error?.message || 'Error al crear la cuenta. Intenta nuevamente.';
      await this.mostrarToast(mensaje, 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleMostrarConfirmarPassword() {
    this.mostrarConfirmarPassword = !this.mostrarConfirmarPassword;
  }

  volverLogin() {
    this.router.navigate(['/auth/login']);
  }
}