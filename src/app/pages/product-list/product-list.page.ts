import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Product, Categorie } from '../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ProductCardComponent, HeaderComponent, LoadingComponent, FormsModule]
})
export class ProductListPage implements OnInit {
  cargando: boolean = true;
  productos: Product[] = [];
  productosFiltrados: Product[] = [];
  categorias: Categorie[] = [];
  
  // Filtros
  categoriaSeleccionada: string = '';
  ordenSeleccionado: string = 'recientes';
  precioMin: number = 0;
  precioMax: number = 10000;
  
  mostrarFiltros: boolean = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.categoriaSeleccionada = params['categoria'] || '';
    });
    
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.cargando = true;
      const timeNow = new Date().getTime();
      
      // Cargar categorías para el filtro
      const respuestaHome = await this.productService.getHomeProducts(timeNow).toPromise();
      this.categorias = respuestaHome.categories || [];
      
      // Aplicar filtros
      await this.aplicarFiltros();
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async aplicarFiltros() {
    try {
      const timeNow = new Date().getTime();
      const filtros: any = {};
      
      if (this.categoriaSeleccionada) {
        filtros.categorie = this.categoriaSeleccionada;
      }
      
      const respuesta = await this.productService.filterProducts(filtros, timeNow).toPromise();
      this.productos = respuesta.products || [];
      
      // Filtrar por precio
      this.productosFiltrados = this.productos.filter(p => {
        const precio = p.price_usd;
        return precio >= this.precioMin && precio <= this.precioMax;
      });
      
      // Ordenar
      this.ordenarProductos();
      
    } catch (error) {
      console.error('Error al filtrar productos:', error);
    }
  }

  ordenarProductos() {
    switch(this.ordenSeleccionado) {
      case 'precio_asc':
        this.productosFiltrados.sort((a, b) => a.price_usd - b.price_usd);
        break;
      case 'precio_desc':
        this.productosFiltrados.sort((a, b) => b.price_usd - a.price_usd);
        break;
      case 'nombre_asc':
        this.productosFiltrados.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'nombre_desc':
        this.productosFiltrados.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'recientes':
      default:
        this.productosFiltrados.sort((a, b) => {
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        });
        break;
    }
  }

  async cambiarCategoria(event: any) {
    this.categoriaSeleccionada = event.detail.value;
    await this.aplicarFiltros();
  }

  async cambiarOrden(event: any) {
    this.ordenSeleccionado = event.detail.value;
    this.ordenarProductos();
  }

  async cambiarPrecio() {
    await this.aplicarFiltros();
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  limpiarFiltros() {
    this.categoriaSeleccionada = '';
    this.ordenSeleccionado = 'recientes';
    this.precioMin = 0;
    this.precioMax = 10000;
    this.aplicarFiltros();
  }

  async refrescarPagina(event: any) {
    await this.cargarDatos();
    event.target.complete();
  }

  irAProducto(producto: Product) {
    this.router.navigate(['/product-detail', producto.slug]);
  }
}