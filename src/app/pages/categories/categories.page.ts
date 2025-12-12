import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Product, Categorie } from '../../core/models/product.model';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ProductCardComponent, LoadingComponent]
})
export class CategoriesPage implements OnInit {
  cargando: boolean = true;
  categorias: Categorie[] = [];
  productos: Product[] = [];
  categoriaSeleccionada: Categorie | null = null;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarCategorias();
  }

  async cargarCategorias() {
    try {
      this.cargando = true;
      const timeNow = new Date().getTime();
      const respuesta = await this.productService.getHomeProducts(timeNow).toPromise();
      this.categorias = respuesta.categories || [];
      
      // Seleccionar la primera categoría por defecto
      if (this.categorias.length > 0) {
        this.seleccionarCategoria(this.categorias[0]);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      this.cargando = false;
    }
  }

  async seleccionarCategoria(categoria: Categorie) {
    try {
      this.categoriaSeleccionada = categoria;
      this.cargando = true;
      
      const timeNow = new Date().getTime();
      const filtros = {
        categorie: categoria._id
      };
      
      const respuesta = await this.productService.filterProducts(filtros, timeNow).toPromise();
      this.productos = respuesta.products || [];
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async refrescarPagina(event: any) {
    await this.cargarCategorias();
    event.target.complete();
  }

  irAProducto(producto: Product) {
    this.router.navigate(['/product-detail', producto.slug]);
  }
}