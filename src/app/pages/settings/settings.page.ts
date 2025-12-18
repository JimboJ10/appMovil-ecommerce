import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonicModule, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, HeaderComponent]
})
export class SettingsPage implements OnInit {
  formularioPerfil: FormGroup;
  formularioPassword: FormGroup;
  usuario: User | null = null;
  editandoPerfil: boolean = false;
  mostrarCambioPassword: boolean = false;

  // Control de visibilidad de contraseñas
  mostrarPasswordActual: boolean = false;
  mostrarPasswordNuevo: boolean = false;
  mostrarPasswordConfirmar: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.formularioPerfil = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]{9,15}$')]],
      birthday: ['']
    });

    this.formularioPassword = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.validadorPasswordSeguro()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.validadorPasswordsCoinciden('newPassword', 'confirmPassword')
    });
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.usuario = await this.authService.getCurrentUser();
      if (this.usuario) {
        this.formularioPerfil.patchValue({
          name: this.usuario.name,
          surname: this.usuario.surname,
          email: this.usuario.email,
          phone: this.usuario.phone || '',
          birthday: this.usuario.birthday || ''
        });
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }

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

  obtenerRequisitosPassword() {
    const passwordControl = this.formularioPassword.get('newPassword');
    
    // Si no hay control o valor, devolver todo en false
    if (!passwordControl || !passwordControl.value) {
      return {
        tieneMayuscula: false,
        tieneMinuscula: false,
        tieneNumero: false,
        tieneCaracterEspecial: false
      };
    }
  
    const valor = passwordControl.value;

    return {
      tieneMayuscula: /[A-Z]/.test(valor),
      tieneMinuscula: /[a-z]/.test(valor),
      tieneNumero: /[0-9]/.test(valor),
      tieneCaracterEspecial: /[!@#$%^&*(),.?":{}|<>]/.test(valor)
    };
  }

  toggleEditarPerfil() {
    this.editandoPerfil = !this.editandoPerfil;
    if (!this.editandoPerfil) {
      this.cargarDatos();
    }
  }

  toggleCambioPassword() {
    this.mostrarCambioPassword = !this.mostrarCambioPassword;
    if (!this.mostrarCambioPassword) {
      this.formularioPassword.reset();
    }
  }

  async guardarPerfil() {
    if (this.formularioPerfil.invalid) {
      Object.keys(this.formularioPerfil.controls).forEach(key => {
        this.formularioPerfil.get(key)?.markAsTouched();
      });
      await this.mostrarToast('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Actualizando perfil...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const datosActualizados = {
        ...this.usuario,
        ...this.formularioPerfil.value
      };

      // Aquí llamarías al servicio para actualizar el perfil
      // await this.authService.updateProfile(datosActualizados).toPromise();
      
      this.authService.updateUser(datosActualizados);
      await loading.dismiss();
      await this.mostrarToast('Perfil actualizado correctamente', 'success');
      this.editandoPerfil = false;
    } catch (error) {
      await loading.dismiss();
      console.error('Error al actualizar perfil:', error);
      await this.mostrarToast('Error al actualizar el perfil', 'danger');
    }
  }

  // CAMBIAR CONTRASEÑA
  async cambiarPassword() {
    if (this.formularioPassword.invalid) {
      Object.keys(this.formularioPassword.controls).forEach(key => {
        this.formularioPassword.get(key)?.markAsTouched();
      });
      await this.mostrarToast('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    // Confirmar cambio
    const alert = await this.alertCtrl.create({
      header: 'Confirmar cambio',
      message: '¿Estás seguro de que deseas cambiar tu contraseña?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cambiar',
          handler: async () => {
            await this.ejecutarCambioPassword();
          }
        }
      ]
    });

    await alert.present();
  }

  async ejecutarCambioPassword() {
    const loading = await this.loadingCtrl.create({
      message: 'Cambiando contraseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { currentPassword, newPassword } = this.formularioPassword.value;

      if (!this.usuario || !this.usuario._id) {
        throw new Error('Usuario no encontrado');
      }

      await this.authService.changePassword(
        this.usuario._id,
        currentPassword,
        newPassword
      ).toPromise();

      await loading.dismiss();
      await this.mostrarToast('Contraseña actualizada correctamente', 'success');
      
      // Resetear formulario
      this.formularioPassword.reset();
      this.mostrarCambioPassword = false;

    } catch (error: any) {
      await loading.dismiss();
      console.error('Error al cambiar contraseña:', error);
      
      let mensaje = 'Error al cambiar la contraseña';
      
      if (error?.error?.message_text) {
        mensaje = error.error.message_text;
      } else if (error?.status === 401) {
        mensaje = 'La contraseña actual es incorrecta';
      }
      
      await this.mostrarToast(mensaje, 'danger');
    }
  }

  campoInvalido(campo: string, formulario: 'perfil' | 'password' = 'perfil'): boolean {
    const form = formulario === 'perfil' ? this.formularioPerfil : this.formularioPassword;
    const control = form.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string, formulario: 'perfil' | 'password' = 'perfil'): string {
    const form = formulario === 'perfil' ? this.formularioPerfil : this.formularioPassword;
    const control = form.get(campo);
    
    if (!control || !control.touched) return '';

    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (campo === 'newPassword' && control.hasError('passwordDebil')) {
      return 'La contraseña no cumple con los requisitos de seguridad';
    }

    if (campo === 'confirmPassword' && control.hasError('passwordsNoCoinciden')) {
      return 'Las contraseñas no coinciden';
    }

    if (control.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength']?.requiredLength} caracteres`;
    }

    return '';
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  obtenerIniciales(): string {
    if (!this.usuario) return '';
    const nombre = this.usuario.name?.charAt(0) || '';
    const apellido = this.usuario.surname?.charAt(0) || '';
    return (nombre + apellido).toUpperCase();
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }
}