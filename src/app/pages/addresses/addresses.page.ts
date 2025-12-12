import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AddressService } from '../../core/services/address.service';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Address } from '../../core/models/address.model';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.page.html',
  styleUrls: ['./addresses.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, HeaderComponent, LoadingComponent]
})
export class AddressesPage implements OnInit {
  direcciones: Address[] = [];
  cargando: boolean = true;
  mostrarFormulario: boolean = false;
  formularioDireccion: FormGroup;
  editando: boolean = false;
  direccionEditando: Address | null = null;

  paises = [
    'Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica',
    'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México',
    'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Uruguay', 'Venezuela'
  ];

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.formularioDireccion = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      pais: ['', Validators.required],
      address: ['', Validators.required],
      ciudad: ['', Validators.required],
      region: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]],
      email: ['', [Validators.required, Validators.email]],
      referencia: [''],
      nota: ['']
    });
  }

  async ngOnInit() {
    await this.cargarDirecciones();
  }

  async cargarDirecciones() {
    try {
      this.cargando = true;
      const user = await this.authService.getCurrentUser();
      
      if (!user) {
        this.router.navigate(['/auth/login']);
        return;
      }

      const respuesta = await this.addressService.getAddresses(user._id!).toPromise();
      this.direcciones = respuesta.address_client;
    } catch (error) {
      console.error('Error al cargar direcciones:', error);
      await this.mostrarToast('Error al cargar direcciones', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  mostrarFormularioNuevo() {
    this.editando = false;
    this.direccionEditando = null;
    this.formularioDireccion.reset();
    this.mostrarFormulario = true;
  }

  mostrarFormularioEdicion(direccion: Address) {
    this.editando = true;
    this.direccionEditando = direccion;
    this.formularioDireccion.patchValue(direccion);
    this.mostrarFormulario = true;
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.editando = false;
    this.direccionEditando = null;
    this.formularioDireccion.reset();
  }

  async guardarDireccion() {
    if (this.formularioDireccion.invalid) {
      Object.keys(this.formularioDireccion.controls).forEach(key => {
        this.formularioDireccion.get(key)?.markAsTouched();
      });
      await this.mostrarToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    try {
      const user = await this.authService.getCurrentUser();
      const datosDireccion = {
        ...this.formularioDireccion.value,
        user: user!._id
      };

      if (this.editando && this.direccionEditando) {
        datosDireccion._id = this.direccionEditando._id;
        await this.addressService.updateAddress(datosDireccion).toPromise();
        await this.mostrarToast('Dirección actualizada correctamente', 'success');
      } else {
        await this.addressService.createAddress(datosDireccion).toPromise();
        await this.mostrarToast('Dirección creada correctamente', 'success');
      }

      this.cancelarFormulario();
      await this.cargarDirecciones();
    } catch (error) {
      console.error('Error al guardar dirección:', error);
      await this.mostrarToast('Error al guardar la dirección', 'danger');
    }
  }

  async confirmarEliminar(direccion: Address) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Dirección',
      message: '¿Estás seguro de que deseas eliminar esta dirección?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarDireccion(direccion);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarDireccion(direccion: Address) {
    try {
      await this.addressService.deleteAddress(direccion._id!).toPromise();
      await this.mostrarToast('Dirección eliminada correctamente', 'success');
      await this.cargarDirecciones();
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      await this.mostrarToast('Error al eliminar la dirección', 'danger');
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

  campoInvalido(campo: string): boolean {
    const control = this.formularioDireccion.get(campo);
    return !!(control && control.invalid && control.touched);
  }
}