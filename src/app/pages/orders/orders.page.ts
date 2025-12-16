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
      
      console.log('📡 Cargando órdenes...');

      // No necesitamos pasar user_id, el backend lo obtiene del token
      const respuesta = await this.orderService.getMyOrders().toPromise();
      
      console.log('✅ Respuesta del servidor:', respuesta);
      
      this.ordenes = respuesta?.sales || [];
      
      console.log(`📦 Total de órdenes: ${this.ordenes.length}`);
      
    } catch (error: any) {
      console.error('❌ Error al cargar órdenes:', error);
      
      // Verificar si el error es de autenticación
      if (error.status === 401 || error.status === 403) {
        console.log('⚠️ Token inválido, redirigiendo a login...');
        this.router.navigate(['/auth/login']);
      }
    } finally {
      this.cargando = false;
    }
  }

  get ordenesFiltradas() {
    // Aquí podrías filtrar por estado si lo implementas
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
    // Lógica para determinar el estado
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