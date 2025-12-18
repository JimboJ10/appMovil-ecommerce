import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { loadScript } from '@paypal/paypal-js';

import { CartService } from '../../core/services/cart.service';
import { AddressService } from '../../core/services/address.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';

import { Cart, CartSummary } from '../../core/models/cart.model';
import { Address } from '../../core/models/address.model';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, HeaderComponent, LoadingComponent]
})
export class CheckoutPage implements OnInit, AfterViewInit {
  cargando: boolean = true;
  procesandoPago: boolean = false;

  carrito: Cart[] = [];
  resumen: CartSummary = {
    subtotal: 0,
    discount: 0,
    total: 0,
    items: 0
  };

  direcciones: Address[] = [];
  direccionSeleccionada: Address | null = null;

  metodoPago: string = 'paypal';
  paypalLoaded: boolean = false;

  constructor(
    private cartService: CartService,
    private addressService: AddressService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  // 🔴 NUEVO: Inicializar PayPal después de que la vista se cargue
  ngAfterViewInit() {
    setTimeout(() => {
      if (this.direccionSeleccionada) {
        this.initPayPal();
      }
    }, 500);
  }

  async cargarDatos() {
    try {
      this.cargando = true;
      const user = await this.authService.getCurrentUser();

      if (!user) {
        this.router.navigate(['/auth/login']);
        return;
      }

      // Cargar carrito
      const respuestaCarrito = await this.cartService.getCartItems(user._id!).toPromise();
      this.carrito = respuestaCarrito?.carts || [];
      this.resumen = this.cartService.calculateCartSummary(this.carrito);

      if (this.carrito.length === 0) {
        await this.mostrarToast('El carrito está vacío', 'warning');
        this.router.navigate(['/tabs/cart']);
        return;
      }

      // Cargar direcciones
      const respuestaDirecciones = await this.addressService.getAddresses(user._id!).toPromise();
      this.direcciones = respuestaDirecciones?.address_client || [];

      if (this.direcciones.length > 0) {
        this.direccionSeleccionada = this.direcciones[0];
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      await this.mostrarToast('Error al cargar datos del checkout', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async initPayPal() {
    try {

      const paypal = await loadScript({
        clientId: environment.paypalClientId,
        currency: 'USD'
      });

      if (paypal && paypal.Buttons) {
        this.paypalLoaded = true;
        
        // Esperar un tick para asegurar que el DOM está listo
        setTimeout(() => {
          this.renderPayPalButton();
        }, 100);
      } else {
        console.error('❌ PayPal Buttons no está disponible');
        await this.mostrarToast('Error al cargar PayPal', 'danger');
      }
    } catch (error) {
      console.error('❌ Error al cargar PayPal:', error);
      await this.mostrarToast('Error al cargar PayPal: ' + error, 'danger');
    }
  }

  renderPayPalButton() {
    const paypalContainer = document.getElementById('paypal-button-container');

    if (!paypalContainer) {
      console.error('❌ Contenedor #paypal-button-container no encontrado');
      return;
    }

    // Limpiar contenedor antes de renderizar
    paypalContainer.innerHTML = '';

    try {
      (window as any).paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: this.resumen.total.toFixed(2)
              }
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          await this.procesarPago(order);
        },
        onError: (err: any) => {
          console.error('❌ Error en PayPal:', err);
          this.mostrarToast('Error al procesar el pago con PayPal', 'danger');
        },
        onCancel: (data: any) => {
          this.mostrarToast('Pago cancelado', 'warning');
        }
      }).render('#paypal-button-container');

    } catch (error) {
      console.error('❌ Error al renderizar botón de PayPal:', error);
      this.mostrarToast('Error al renderizar botón de PayPal', 'danger');
    }
  }

  getPrecioConDescuento(item: Cart): number {
    return item.total / item.cantidad;
  }

  getPrecioOriginal(item: Cart): number {
    return item.price_unitario;
  }

  tieneDescuento(item: Cart): boolean {
    return item.discount > 0;
  }

  getDescuentoTexto(item: Cart): string {
    if (item.type_discount === 1) {
      return `-${item.discount}%`;
    } else {
      return `-$${item.discount}`;
    }
  }

  getMontoDescuento(item: Cart): number {
    return item.subtotal - item.total;
  }


  async procesarPago(paypalOrder: any) {
    if (!this.direccionSeleccionada) {
      await this.mostrarToast('Selecciona una dirección de envío', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Procesando orden...',
      spinner: 'crescent'
    });
    await loading.present();

    this.procesandoPago = true;

    try {
      const user = await this.authService.getCurrentUser();

      const datosOrden = {
        sale: {
          user: user!._id,
          method_payment: 'PAYPAL',
          currency_payment: 'USD',
          n_transacccion: paypalOrder.id,
          total: this.resumen.total,
          currency_total: 'USD',
          price_dolar: 1
        },
        sale_address: {
          name: this.direccionSeleccionada.name,
          surname: this.direccionSeleccionada.surname,
          pais: this.direccionSeleccionada.pais,
          address: this.direccionSeleccionada.address,
          referencia: this.direccionSeleccionada.referencia || '',
          ciudad: this.direccionSeleccionada.ciudad,
          region: this.direccionSeleccionada.region,
          telefono: this.direccionSeleccionada.telefono,
          email: this.direccionSeleccionada.email,
          nota: this.direccionSeleccionada.nota || ''
        }
      };

      await this.orderService.createOrder(datosOrden).toPromise();

      await loading.dismiss();
      await this.mostrarToast('¡Compra realizada con éxito!', 'success');
      
      // Limpiar carrito
      this.cartService.clearCart();
      
      // Redirigir a mis pedidos
      this.router.navigate(['/orders']);

    } catch (error: any) {
      await loading.dismiss();
      console.error('❌ Error al procesar orden:', error);
      const mensaje = error?.error?.message || 'Error al procesar la orden';
      await this.mostrarToast(mensaje, 'danger');
    } finally {
      this.procesandoPago = false;
    }
  }

  seleccionarDireccion(direccion: Address) {
    this.direccionSeleccionada = direccion;
    
    // Reinicializar PayPal si ya estaba cargado
    if (this.paypalLoaded) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
        this.renderPayPalButton();
      }
    } else {
      this.initPayPal();
    }
  }

  async agregarNuevaDireccion() {
    this.router.navigate(['/addresses']);
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
}