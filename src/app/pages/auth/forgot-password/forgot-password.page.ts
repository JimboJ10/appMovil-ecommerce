import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ForgotPasswordPage implements OnInit {
  formularioRecuperar: FormGroup;
  cargando: boolean = false;
  emailEnviado: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.formularioRecuperar = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]]
    });
  }

  ngOnInit() {}

  get emailInvalido() {
    const email = this.formularioRecuperar.get('email');
    return email?.invalid && email?.touched;
  }

  obtenerMensajeErrorEmail(): string {
    const email = this.formularioRecuperar.get('email');
    if (email?.hasError('required')) {
      return 'El correo electrónico es requerido';
    }
    if (email?.hasError('email') || email?.hasError('pattern')) {
      return 'Ingresa un correo electrónico válido';
    }
    return '';
  }

  async enviarInstrucciones() {
    if (this.formularioRecuperar.invalid) {
      this.formularioRecuperar.get('email')?.markAsTouched();
      await this.mostrarToast('Por favor ingresa un correo electrónico válido', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Enviando instrucciones...',
      spinner: 'crescent'
    });
    await loading.present();

    this.cargando = true;

    try {
      // Aquí iría la llamada al servicio de recuperación de contraseña
      // Por ahora simularemos el envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await loading.dismiss();
      this.emailEnviado = true;
      await this.mostrarToast('Se han enviado las instrucciones a tu correo', 'success');
    } catch (error: any) {
      await loading.dismiss();
      const mensaje = error?.error?.message || 'Error al enviar las instrucciones. Intenta nuevamente.';
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

  volverLogin() {
    this.router.navigate(['/auth/login']);
  }

  reenviarCorreo() {
    this.emailEnviado = false;
    this.enviarInstrucciones();
  }
}