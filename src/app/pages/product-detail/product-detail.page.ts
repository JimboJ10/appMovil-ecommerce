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
import { addIcons } from 'ionicons';
import {
  cartOutline,
  checkmarkCircle,
  closeCircle,
  remove,
  add,
  arrowUp
} from 'ionicons/icons';
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
  ) {
    addIcons({
      cartOutline,
      checkmarkCircle,
      closeCircle,
      remove,
      add,
      arrowUp
    });
  }

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    
    // 🔴 AGREGAR LOGS
    console.log('🔍 Slug recibido:', slug);
    
    if (slug) {
      await this.cargarProducto(slug);
    } else {
      console.error('❌ No se recibió slug');
      await this.mostrarToast('Error: No se encontró el producto', 'danger');
      this.router.navigate(['/tabs/home']);
    }
  }

  async cargarProducto(slug: string) {
    try {
      this.cargando = true;
      
      console.log('📡 Cargando producto con slug:', slug);
      
      const respuesta = await this.productService.getProductDetail(slug).toPromise();
      
      console.log('✅ Respuesta del servidor:', respuesta);
      
      if (!respuesta || !respuesta.product) {
        throw new Error('No se recibió el producto del servidor');
      }
      
      this.producto = respuesta.product;
  
      // Logs de debug
      console.log('📦 Producto cargado:');
      console.log('  - type_inventario:', this.producto?.type_inventario);
      console.log('  - stock:', this.producto?.stock);
      console.log('  - variedades:', this.producto?.variedades);
  
      // Seleccionar la primera variedad si existe
      if (this.producto?.variedades && this.producto.variedades.length > 0) {
        this.variedadSeleccionada = this.producto.variedades[0];
        console.log('✅ Variedad seleccionada:', this.variedadSeleccionada);
      } else {
        console.log('ℹ️ No hay variedades para este producto');
      }
      
      console.log('📊 Stock disponible:', this.obtenerStockDisponible());
      
    } catch (error: any) {
      console.error('❌ Error al cargar producto:', error);
      
      let mensaje = 'Error al cargar el producto';
      if (error.status === 404) {
        mensaje = 'Producto no encontrado';
      } else if (error.error?.message) {
        mensaje = error.error.message;
      }
      
      await this.mostrarToast(mensaje, 'danger');
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
  
    // Si es inventario múltiple (type_inventario === 2)
    if (this.producto.type_inventario === 2) {
      // Si hay variedades disponibles
      if (this.producto.variedades && this.producto.variedades.length > 0) {
        // Si hay una variedad seleccionada, devolver su stock
        if (this.variedadSeleccionada) {
          return this.variedadSeleccionada.stock;
        }
        // Si NO hay variedad seleccionada, devolver 0 (debe seleccionar una)
        return 0;
      } else {
        // Si NO hay variedades configuradas, usar el stock general del producto
        return this.producto.stock;
      }
    }
    
    // Si es inventario único (type_inventario === 1), devolver stock del producto
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
  
    console.log('🛒 Intentando agregar al carrito...');
    console.log('  - Producto:', this.producto?.title);
    console.log('  - Stock disponible:', this.obtenerStockDisponible());
    console.log('  - Cantidad:', this.cantidad);
    console.log('  - Variedad seleccionada:', this.variedadSeleccionada);
  
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
  
    // Validar variedad SOLO si es inventario múltiple Y hay variedades configuradas
    if (this.producto?.type_inventario === 2 && 
        this.producto.variedades && 
        this.producto.variedades.length > 0 && 
        !this.variedadSeleccionada) {
      await this.mostrarToast('Debes seleccionar una variedad', 'warning');
      return;
    }
  
    try {
      // 🔴 VERIFICAR SI EL PRODUCTO YA ESTÁ EN EL CARRITO
      const existingCart = await this.cartService.checkProductInCart(
        this.producto!._id!,
        this.variedadSeleccionada?._id
      );
  
      if (existingCart) {
        console.log('⚠️ Producto ya existe en el carrito');
        
        // 🔴 MOSTRAR MENSAJE Y NO AGREGAR
        await this.mostrarToast(
          'Este producto ya está en tu carrito. Ve al carrito para modificar la cantidad.',
          'warning'
        );
        
        // Opcional: Navegar al carrito
        // this.router.navigate(['/tabs/cart']);
        
        return;
      }
  
      // 🔴 SI NO EXISTE, AGREGAR NUEVO PRODUCTO AL CARRITO
      const cartData: any = {
        user: user._id,
        product: this.producto?._id,
        cantidad: this.cantidad,
        type_discount: this.tieneDescuento ? this.producto!.campaing_discount!.type_discount : 1,
        discount: this.tieneDescuento ? this.producto!.campaing_discount!.discount : 0,
        code_discount: this.tieneDescuento ? this.producto!.campaing_discount!._id : null,
        price_unitario: this.precioConDescuento,
        subtotal: this.producto!.price_usd * this.cantidad,
        total: this.precioConDescuento * this.cantidad
      };
  
      if (this.variedadSeleccionada) {
        cartData.variedad = this.variedadSeleccionada._id;
      }
  
      console.log('📤 Datos a enviar al carrito:', cartData);
  
      await this.cartService.addToCart(cartData).toPromise();
      await this.mostrarToast('Producto agregado al carrito', 'success');
      
    } catch (error: any) {
      console.error('❌ Error al agregar al carrito:', error);
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