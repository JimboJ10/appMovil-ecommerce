import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  lockClosedOutline,
  mailOutline,
  storefrontOutline,
  logInOutline,
  personAddOutline,
  alertCircle
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  formularioLogin: FormGroup;
  mostrarPassword: boolean = false;
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {

    addIcons({
    eyeOutline,
    eyeOffOutline,
    lockClosedOutline,
    mailOutline,
    storefrontOutline,
    logInOutline,
    personAddOutline,
    alertCircle
  });
  
    this.formularioLogin = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]]
    });
  }

  ngOnInit() {}

  get emailInvalido() {
    const email = this.formularioLogin.get('email');
    return email?.invalid && email?.touched;
  }

  get passwordInvalido() {
    const password = this.formularioLogin.get('password');
    return password?.invalid && password?.touched;
  }

  obtenerMensajeErrorEmail(): string {
    const email = this.formularioLogin.get('email');
    if (email?.hasError('required')) {
      return 'El correo electrónico es requerido';
    }
    if (email?.hasError('email') || email?.hasError('pattern')) {
      return 'Ingresa un correo electrónico válido';
    }
    return '';
  }

  obtenerMensajeErrorPassword(): string {
    const password = this.formularioLogin.get('password');
    if (password?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (password?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return '';
  }

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async iniciarSesion() {
    if (this.formularioLogin.invalid) {
      Object.keys(this.formularioLogin.controls).forEach(key => {
        this.formularioLogin.get(key)?.markAsTouched();
      });
      await this.mostrarToast('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    this.cargando = true;

    try {
      const { email, password } = this.formularioLogin.value;
      await this.authService.login(email, password).toPromise();
      
      await loading.dismiss();
      await this.mostrarToast('¡Bienvenido!', 'success');
      this.router.navigate(['/tabs/home']);
    } catch (error: any) {
      await loading.dismiss();
      const mensaje = error?.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
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

  irARegistro() {
    this.router.navigate(['/auth/register']);
  }

  irARecuperarPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }
}