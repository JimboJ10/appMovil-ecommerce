import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../../core/services/review.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RatingStarsComponent } from '../../shared/components/rating-stars/rating-stars.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import moment from 'moment';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, HeaderComponent, RatingStarsComponent, LoadingComponent]
})
export class ReviewsPage implements OnInit {
  cargando: boolean = true;
  producto: any = null;
  resenas: any[] = [];
  
  // Formulario
  mostrarFormulario: boolean = false;
  puedeResenar: boolean = false;
  yaReseno: boolean = false;
  calificacion: number = 0;
  descripcion: string = '';
  editando: boolean = false;
  resenaActual: any = null;
  saleDetailId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService,
    private productService: ProductService,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const productoId = this.route.snapshot.paramMap.get('id');
    
    if (productoId) {
      await this.cargarProductoYResenas(productoId);
    }
  }

  async cargarProductoYResenas(productoId: string) {
    try {
      this.cargando = true;
  
      console.log('📡 Cargando información del producto:', productoId);
  
      // 🔴 NO NECESITAMOS CARGAR TODO EL PRODUCTO, SOLO SU ID Y TÍTULO
      // Primero verificar si podemos reseñar
      await this.verificarPuedeResenar(productoId);
      
      // Cargar reseñas del producto
      await this.cargarResenas(productoId);
  
      // 🔴 OBTENER INFORMACIÓN BÁSICA DEL PRODUCTO DESDE LAS RESEÑAS
      if (this.resenas.length > 0 && this.resenas[0].product) {
        this.producto = this.resenas[0].product;
      } else {
        // Si no hay reseñas, cargar producto básico
        const respuestaProducto = await this.productService.getProductDetail(productoId).toPromise();
        this.producto = respuestaProducto.product;
      }
  
      console.log('📦 Producto cargado:', this.producto?.title);
  
    } catch (error) {
      console.error('Error al cargar producto y reseñas:', error);
      await this.mostrarToast('Error al cargar la información', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async cargarResenas(productoId: string) {
    try {
      const respuesta = await this.reviewService.getProductReviews(productoId).toPromise();
      this.resenas = respuesta.reviews || [];
      
      console.log(`📋 Reseñas cargadas: ${this.resenas.length}`);
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
      this.resenas = [];
    }
  }

  async verificarPuedeResenar(productoId: string) {
    try {
      const user = await this.authService.getCurrentUser();
      
      if (!user) {
        this.puedeResenar = false;
        return;
      }

      const respuesta = await this.reviewService.checkCanReview(user._id!, productoId).toPromise();
      
      console.log('🔍 Verificación de reseña:', respuesta);

      this.puedeResenar = respuesta.can_review;
      this.yaReseno = respuesta.has_review;
      this.saleDetailId = respuesta.sale_detail || '';

      if (this.yaReseno && respuesta.review) {
        this.resenaActual = respuesta.review;
        this.calificacion = respuesta.review.cantidad;
        this.descripcion = respuesta.review.description;
      }

    } catch (error) {
      console.error('Error al verificar si puede reseñar:', error);
      this.puedeResenar = false;
    }
  }

  onCalificacionChange(calificacion: number) {
    this.calificacion = calificacion;
  }

  abrirFormulario() {
    if (!this.puedeResenar && !this.yaReseno) {
      this.mostrarToast('Debes comprar este producto para dejar una reseña', 'warning');
      return;
    }

    this.mostrarFormulario = true;
    this.editando = this.yaReseno;
  }

  async guardarResena() {
    if (this.calificacion === 0) {
      await this.mostrarToast('Selecciona una calificación', 'warning');
      return;
    }

    if (!this.descripcion.trim()) {
      await this.mostrarToast('Escribe un comentario', 'warning');
      return;
    }

    try {
      const user = await this.authService.getCurrentUser();
      
      if (!user || !user._id) {
        await this.mostrarToast('Error: Usuario no autenticado', 'danger');
        this.router.navigate(['/auth/login']);
        return;
      }

      const datosResena: any = {
        product: this.producto._id,
        sale_detail: this.saleDetailId,
        user: user._id,
        cantidad: this.calificacion,
        description: this.descripcion
      };

      if (this.editando && this.resenaActual) {
        // Actualizar reseña existente
        datosResena._id = this.resenaActual._id;
        await this.reviewService.updateReview(datosResena).toPromise();
        await this.mostrarToast('Reseña actualizada correctamente', 'success');
      } else {
        // Crear nueva reseña
        await this.reviewService.createReview(datosResena).toPromise();
        await this.mostrarToast('Reseña creada correctamente', 'success');
      }

      this.cancelarFormulario();
      await this.cargarProductoYResenas(this.producto._id);
      
    } catch (error: any) {
      console.error('Error al guardar reseña:', error);
      const mensaje = error?.error?.message_text || 'Error al guardar la reseña';
      await this.mostrarToast(mensaje, 'danger');
    }
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    if (!this.yaReseno) {
      this.calificacion = 0;
      this.descripcion = '';
    }
  }

  formatearFecha(fecha: Date): string {
    return moment(fecha).format('DD MMM YYYY');
  }

  obtenerIniciales(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
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