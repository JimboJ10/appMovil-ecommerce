import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
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
  usuario: User | null = null;
  editandoPerfil: boolean = false;
  editandoPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    this.formularioPerfil = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]{9,15}$')]],
      birthday: ['']
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

  toggleEditarPerfil() {
    this.editandoPerfil = !this.editandoPerfil;
    if (!this.editandoPerfil) {
      this.cargarDatos();
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

  campoInvalido(campo: string): boolean {
    const control = this.formularioPerfil.get(campo);
    return !!(control && control.invalid && control.touched);
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