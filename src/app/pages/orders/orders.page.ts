import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import moment from 'moment';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, HeaderComponent, LoadingComponent]
})
export class OrdersPage implements OnInit {
  cargando: boolean = true;
  ordenes: any[] = [];
  segmentoSeleccionado: string = 'todas';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarOrdenes();
  }

  async cargarOrdenes() {
    try {
      this.cargando = true;

      const respuesta = await this.orderService.getMyOrders().toPromise();
      
      this.ordenes = respuesta?.sales || [];
      
    } catch (error: any) {
      console.error('❌ Error al cargar órdenes:', error);
      
      if (error.status === 401 || error.status === 403) {
        this.router.navigate(['/auth/login']);
      }
    } finally {
      this.cargando = false;
    }
  }

  get ordenesFiltradas() {
    return this.ordenes;
  }

  async refrescarPagina(event: any) {
    await this.cargarOrdenes();
    event.target.complete();
  }

  verDetalleOrden(orden: any) {
    this.router.navigate(['/order-detail', orden._id]);
  }

  formatearFecha(fecha: Date): string {
    return moment(fecha).format('DD MMM YYYY');
  }

  obtenerEstadoOrden(orden: any): string {
    // Por ahora todas están completadas
    return 'Completado';
  }

  obtenerColorEstado(estado: string): string {
    switch(estado) {
      case 'Completado': return 'success';
      case 'Pendiente': return 'warning';
      case 'Cancelado': return 'danger';
      default: return 'medium';
    }
  }
}