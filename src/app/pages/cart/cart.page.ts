import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Cart, CartSummary } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, LoadingComponent]
})
export class CartPage implements OnInit {
  cargando: boolean = true;
  carrito: Cart[] = [];
  resumen: CartSummary = {
    subtotal: 0,
    discount: 0,
    total: 0,
    items: 0
  };

  codigoCupon: string = '';
  aplicandoCupon: boolean = false;
  cuponAplicado: boolean = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarCarrito();
  }

  async ionViewWillEnter() {
    await this.cargarCarrito();
  }

  async cargarCarrito() {
    try {
      this.cargando = true;
      const user = await this.authService.getCurrentUser();
      
      if (!user) {
        // Redirigir a login
        this.router.navigate(['/auth/login']);
        return;
      }
  
      const respuesta = await this.cartService.getCartItems(user._id!).toPromise();
      this.carrito = respuesta?.carts || [];
      this.calcularResumen();
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      await this.mostrarToast('Error al cargar el carrito', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  calcularResumen() {
    this.resumen = this.cartService.calculateCartSummary(this.carrito);
  }

  async actualizarCantidad(item: Cart, nuevaCantidad: number) {
    if (nuevaCantidad < 1) return;
  
    // Validar stock disponible
    const stockDisponible = item.product.type_inventario === 2 && item.variedad 
      ? (typeof item.variedad === 'object' ? item.variedad.stock : 0)
      : item.product.stock;
  
    if (nuevaCantidad > stockDisponible) {
      await this.mostrarToast(`Solo hay ${stockDisponible} unidades disponibles`, 'warning');
      return;
    }
  
    try {
      const precioOriginal = item.price_unitario;
      
      const subtotal = precioOriginal * nuevaCantidad;
      
      let precioConDescuento = precioOriginal;
      
      if (item.discount > 0) {
        if (item.type_discount === 1) {
          // Descuento por porcentaje
          precioConDescuento = precioOriginal - (precioOriginal * item.discount / 100);
        } else {
          // Descuento por monto fijo
          precioConDescuento = precioOriginal - item.discount;
        }
      }
      
      const total = precioConDescuento * nuevaCantidad;
  
      const datosActualizados: any = {
        _id: item._id,
        product: item.product._id,
        cantidad: nuevaCantidad,
        type_discount: item.type_discount,
        discount: item.discount,
        code_cupon: item.code_cupon,
        code_discount: item.code_discount,
        price_unitario: precioOriginal, // Precio ORIGINAL
        subtotal: subtotal,             // Subtotal sin descuento
        total: total                    // Total con descuento
      };
  
      // Agregar variedad si existe
      if (item.variedad) {
        const variedadId = typeof item.variedad === 'object' 
          ? item.variedad._id 
          : item.variedad;
        
        if (variedadId) {
          datosActualizados.variedad = variedadId;
        }
      }
  
      await this.cartService.updateCartItem(datosActualizados).toPromise();
      await this.cargarCarrito();
      await this.mostrarToast('Cantidad actualizada', 'success');
    } catch (error: any) {
      console.error('Error al actualizar cantidad:', error);
      
      // Mostrar mensaje específico si viene del backend
      const mensaje = error?.error?.message_text || 'Error al actualizar cantidad';
      await this.mostrarToast(mensaje, 'danger');
    }
  }

  async confirmarEliminacion(item: Cart) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Deseas eliminar "${item.product.title}" del carrito?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarProducto(item);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarProducto(item: Cart) {
    try {
      await this.cartService.removeCartItem(item._id!).toPromise();
      await this.cargarCarrito();
      await this.mostrarToast('Producto eliminado del carrito', 'success');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      await this.mostrarToast('Error al eliminar producto', 'danger');
    }
  }

  async aplicarCupon() {
    if (!this.codigoCupon.trim()) {
      await this.mostrarToast('Ingresa un código de cupón', 'warning');
      return;
    }

    try {
      this.aplicandoCupon = true;
      const user = await this.authService.getCurrentUser();
      
      await this.cartService.applyCoupon(this.codigoCupon, user!._id!).toPromise();
      
      this.cuponAplicado = true;
      await this.cargarCarrito();
      await this.mostrarToast('¡Cupón aplicado con éxito!', 'success');
    } catch (error: any) {
      console.error('Error al aplicar cupón:', error);
      const mensaje = error?.error?.message_text || 'Error al aplicar el cupón';
      await this.mostrarToast(mensaje, 'danger');
    } finally {
      this.aplicandoCupon = false;
    }
  }

  irACheckout() {
    if (this.carrito.length === 0) {
      this.mostrarToast('El carrito está vacío', 'warning');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  continuarComprando() {
    this.router.navigate(['/tabs/home']);
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

  obtenerImagenVariedad(item: Cart): string {
    if (item.variedad && typeof item.variedad === 'object') {
      return item.variedad.valor;
    }
    return '';
  }
}