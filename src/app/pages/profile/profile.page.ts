import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProfilePage implements OnInit {
  usuario: User | null = null;
  cargando: boolean = true;

  menuOpciones = [
    {
      titulo: 'Mis Pedidos',
      icono: 'receipt-outline',
      ruta: '/orders',
      color: 'primary'
    },
    {
      titulo: 'Mis Direcciones',
      icono: 'location-outline',
      ruta: '/addresses',
      color: 'success'
    },
    {
      titulo: 'Configuración',
      icono: 'settings-outline',
      ruta: '/settings',
      color: 'warning'
    },
    {
      titulo: 'Ayuda y Soporte',
      icono: 'help-circle-outline',
      ruta: '/help',
      color: 'tertiary'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarPerfil();
  }

  async ionViewWillEnter() {
    await this.cargarPerfil();
  }

  async cargarPerfil() {
    try {
      this.cargando = true;
      this.usuario = await this.authService.getCurrentUser();
      
      if (!this.usuario) {
        this.router.navigate(['/auth/login']);
        return;
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      this.cargando = false;
    }
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }

  editarPerfil() {
    this.router.navigate(['/settings']);
  }

  async confirmarCerrarSesion() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'confirm',
          handler: () => {
            this.cerrarSesion();
          }
        }
      ]
    });

    await alert.present();
  }

  async cerrarSesion() {
    try {
      await this.authService.logout();
      await this.mostrarToast('Sesión cerrada correctamente', 'success');
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      await this.mostrarToast('Error al cerrar sesión', 'danger');
    }
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
}