import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import * as moment from 'moment';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, HeaderComponent, LoadingComponent]
})
export class OrderDetailPage implements OnInit {
  cargando: boolean = true;
  orden: any = null;
  detallesOrden: any[] = [];
  direccionEnvio: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  async ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      await this.cargarDetalleOrden(orderId);
    }
  }

  async cargarDetalleOrden(orderId: string) {
    try {
      this.cargando = true;
      const respuesta = await this.orderService.getOrderDetail(orderId).toPromise();
      
      this.orden = respuesta.sale;
      this.detallesOrden = respuesta.sale_details || [];
      this.direccionEnvio = respuesta.sale_address;
    } catch (error) {
      console.error('Error al cargar detalle de orden:', error);
      this.router.navigate(['/orders']);
    } finally {
      this.cargando = false;
    }
  }

  formatearFecha(fecha: Date): string {
    return moment(fecha).format('DD MMMM YYYY, h:mm a');
  }

  calcularSubtotal(): number {
    return this.detallesOrden.reduce((sum, item) => sum + item.subtotal, 0);
  }

  calcularDescuentoTotal(): number {
    return this.detallesOrden.reduce((sum, item) => sum + (item.subtotal - item.total), 0);
  }
}