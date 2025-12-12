import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RatingStarsComponent } from '../../shared/components/rating-stars/rating-stars.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Product, Variedad } from '../../core/models/product.model';

import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    HeaderComponent, 
    RatingStarsComponent,
    LoadingComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductDetailPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  producto: Product | null = null;
  cargando: boolean = true;
  cantidad: number = 1;
  variedadSeleccionada: Variedad | null = null;
  
  // Para las tabs de descripción
  tabSeleccionada: string = 'descripcion';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      await this.cargarProducto(slug);
    }
  }

  async cargarProducto(slug: string) {
    try {
      this.cargando = true;
      const respuesta = await this.productService.getProductDetail(slug).toPromise();
      this.producto = respuesta.product;

      // Seleccionar la primera variedad si existe
      if (this.producto?.variedades && this.producto.variedades.length > 0) {
        this.variedadSeleccionada = this.producto.variedades[0];
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      await this.mostrarToast('Error al cargar el producto', 'danger');
      this.router.navigate(['/tabs/home']);
    } finally {
      this.cargando = false;
    }
  }

  seleccionarVariedad(variedad: Variedad) {
    this.variedadSeleccionada = variedad;
  }

  incrementarCantidad() {
    const stockDisponible = this.obtenerStockDisponible();
    if (this.cantidad < stockDisponible) {
      this.cantidad++;
    } else {
      this.mostrarToast(`Solo hay ${stockDisponible} unidades disponibles`, 'warning');
    }
  }

  decrementarCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  obtenerStockDisponible(): number {
    if (!this.producto) return 0;

    if (this.producto.type_inventario === 2 && this.variedadSeleccionada) {
      return this.variedadSeleccionada.stock;
    }
    
    return this.producto.stock;
  }

  get precioConDescuento(): number {
    if (!this.producto) return 0;
    
    const descuento = this.producto.campaing_discount;
    if (!descuento) return this.producto.price_usd;

    if (descuento.type_discount === 1) {
      // Porcentaje
      return this.producto.price_usd - (this.producto.price_usd * descuento.discount / 100);
    } else {
      // Monto fijo
      return this.producto.price_usd - descuento.discount;
    }
  }

  get tieneDescuento(): boolean {
    return this.producto?.campaing_discount !== null && this.producto?.campaing_discount !== undefined;
  }

  get porcentajeDescuento(): number {
    if (!this.tieneDescuento || !this.producto?.campaing_discount) return 0;

    const descuento = this.producto.campaing_discount;
    if (descuento.type_discount === 1) {
      return descuento.discount;
    } else {
      return Math.round((descuento.discount / this.producto.price_usd) * 100);
    }
  }

  async agregarAlCarrito() {
    // Validar que el usuario esté autenticado
    const user = await this.authService.getCurrentUser();
    if (!user) {
      await this.mostrarToast('Debes iniciar sesión para agregar al carrito', 'warning');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Validar stock
    const stockDisponible = this.obtenerStockDisponible();
    if (stockDisponible === 0) {
      await this.mostrarToast('Producto sin stock', 'danger');
      return;
    }

    if (this.cantidad > stockDisponible) {
      await this.mostrarToast(`Solo hay ${stockDisponible} unidades disponibles`, 'warning');
      return;
    }

    // Validar selección de variedad si es necesario
    if (this.producto?.type_inventario === 2 && !this.variedadSeleccionada) {
      await this.mostrarToast('Debes seleccionar una variedad', 'warning');
      return;
    }

    try {
      const precioUnitario = this.precioConDescuento;
      const subtotal = this.producto!.price_usd * this.cantidad;
      const total = precioUnitario * this.cantidad;
      const descuento = subtotal - total;

      const datosCarrito = {
        user: user._id,
        product: this.producto!._id,
        type_discount: this.tieneDescuento ? this.producto!.campaing_discount!.type_discount : 1,
        discount: this.tieneDescuento ? this.producto!.campaing_discount!.discount : 0,
        cantidad: this.cantidad,
        variedad: this.variedadSeleccionada?._id || null,
        code_cupon: null,
        code_discount: this.tieneDescuento ? this.producto!.campaing_discount!._id : null,
        price_unitario: precioUnitario,
        subtotal: subtotal,
        total: total
      };

      await this.cartService.addToCart(datosCarrito).toPromise();
      await this.mostrarToast('¡Producto agregado al carrito!', 'success');
      
      // Resetear cantidad
      this.cantidad = 1;
    } catch (error: any) {
      console.error('Error al agregar al carrito:', error);
      const mensaje = error?.error?.message_text || 'Error al agregar al carrito';
      await this.mostrarToast(mensaje, 'danger');
    }
  }

  cambiarTab(tab: string) {
    this.tabSeleccionada = tab;
  }

  verResenas() {
    if (this.producto) {
      this.router.navigate(['/reviews', this.producto._id]);
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

  volverArriba() {
    this.content.scrollToTop(500);
  }
}