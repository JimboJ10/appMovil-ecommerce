import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../../core/services/review.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RatingStarsComponent } from '../../shared/components/rating-stars/rating-stars.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

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
  
  mostrarFormulario: boolean = false;
  calificacion: number = 0;
  descripcion: string = '';
  editando: boolean = false;
  resenaEditando: any = null;
  saleDetailId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService,
    private orderService: OrderService,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const productoId = this.route.snapshot.paramMap.get('id');
    const saleDetailId = this.route.snapshot.queryParamMap.get('saleDetail');
    
    if (productoId) {
      this.saleDetailId = saleDetailId || '';
      await this.cargarResenas(productoId);
    }
  }

  async cargarResenas(productoId: string) {
    try {
      this.cargando = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.resenas = [];
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
    } finally {
      this.cargando = false;
    }
  }

  onCalificacionChange(calificacion: number) {
    this.calificacion = calificacion;
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
      
      // VALIDACIÓN MEJORADA
      if (!user || !user._id) {
        await this.mostrarToast('Error: Usuario no autenticado', 'danger');
        this.router.navigate(['/auth/login']);
        return;
      }

      const datosResena: any = {
        product: this.producto._id,
        sale_detail: this.saleDetailId,
        user: user._id, // Ahora garantizamos que NO es undefined
        cantidad: this.calificacion,
        description: this.descripcion
      };

      if (this.editando && this.resenaEditando) {
        datosResena._id = this.resenaEditando._id;
        await this.reviewService.updateReview(datosResena).toPromise();
        await this.mostrarToast('Reseña actualizada correctamente', 'success');
      } else {
        await this.reviewService.createReview(datosResena).toPromise();
        await this.mostrarToast('Reseña creada correctamente', 'success');
      }

      this.cancelarFormulario();
      await this.cargarResenas(this.producto._id);
      
    } catch (error) {
      console.error('Error al guardar reseña:', error);
      await this.mostrarToast('Error al guardar la reseña', 'danger');
    }
  }

  editarResena(resena: any) {
    this.editando = true;
    this.resenaEditando = resena;
    this.calificacion = resena.cantidad;
    this.descripcion = resena.description;
    this.mostrarFormulario = true;
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.editando = false;
    this.resenaEditando = null;
    this.calificacion = 0;
    this.descripcion = '';
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