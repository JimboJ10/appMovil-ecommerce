import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Product, Categorie } from '../../core/models/product.model';

// Importar Swiper
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    ProductCardComponent, 
    LoadingComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  cargando: boolean = true;
  sliders: any[] = [];
  categorias: Categorie[] = [];
  mejoresProductos: Product[] = [];
  nuestrosProductos: Product[] = [];
  productosFlashSale: Product[] = [];
  flashSale: any = null;
  
  // Control del banner de descuento
  mostrarBannerDescuento: boolean = true;
  
  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarDatosInicio();
  }

  async cargarDatosInicio() {
    try {
      this.cargando = true;
      const timeNow = new Date().getTime();
      
      const respuesta = await this.productService.getHomeProducts(timeNow).toPromise();
      
      this.sliders = respuesta.sliders || [];
      this.categorias = respuesta.categories || [];
      this.mejoresProductos = respuesta.best_products || [];
      this.nuestrosProductos = respuesta.our_products || [];
      this.flashSale = respuesta.FlashSale || null;
      this.productosFlashSale = respuesta.campaign_products || [];
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async refrescarPagina(event: any) {
    await this.cargarDatosInicio();
    event.target.complete();
  }

  irACategoria(categoria: Categorie) {
    this.router.navigate(['/product-list'], {
      queryParams: { categoria: categoria._id }
    });
  }

  irAProducto(producto: Product) {
    this.router.navigate(['/product-detail', producto.slug]);
  }

  irABusqueda() {
    this.router.navigate(['/search']);
  }

  cerrarBannerDescuento() {
    this.mostrarBannerDescuento = false;
  }

  // volverArriba() {
  //   this.content.scrollToTop(1000);
  // }

  // Calcular tiempo restante para flash sale
  obtenerTiempoRestante(): string {
    if (!this.flashSale) return '';
    
    const ahora = new Date().getTime();
    const fin = this.flashSale.end_date_num;
    const diferencia = fin - ahora;
    
    if (diferencia <= 0) return 'Finalizado';
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
    
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  verTodo() {
    this.router.navigate(['/tabs/categories']);
  }
}