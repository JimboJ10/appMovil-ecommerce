import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ProductCardComponent, LoadingComponent]
})
export class SearchPage implements OnInit {
  textoBusqueda: string = '';
  productos: Product[] = [];
  cargando: boolean = false;
  buscando: boolean = false;
  mostrarResultados: boolean = false;

  // Búsquedas recientes (guardadas en localStorage)
  busquedasRecientes: string[] = [];

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarBusquedasRecientes();
  }

  cargarBusquedasRecientes() {
    const recientes = localStorage.getItem('busquedas_recientes');
    if (recientes) {
      this.busquedasRecientes = JSON.parse(recientes);
    }
  }

  guardarBusquedaReciente(texto: string) {
    if (!texto.trim()) return;

    // Eliminar duplicados
    this.busquedasRecientes = this.busquedasRecientes.filter(b => b !== texto);
    
    // Agregar al inicio
    this.busquedasRecientes.unshift(texto);
    
    // Mantener solo las últimas 10
    this.busquedasRecientes = this.busquedasRecientes.slice(0, 10);
    
    // Guardar en localStorage
    localStorage.setItem('busquedas_recientes', JSON.stringify(this.busquedasRecientes));
  }

  eliminarBusquedaReciente(texto: string) {
    this.busquedasRecientes = this.busquedasRecientes.filter(b => b !== texto);
    localStorage.setItem('busquedas_recientes', JSON.stringify(this.busquedasRecientes));
  }

  limpiarBusquedasRecientes() {
    this.busquedasRecientes = [];
    localStorage.removeItem('busquedas_recientes');
  }

  async buscarProductos() {
    const textoBusqueda = this.textoBusqueda.trim();
    
    if (!textoBusqueda || textoBusqueda.length < 2) {
      this.mostrarResultados = false;
      return;
    }

    try {
      this.buscando = true;
      this.cargando = true;
      this.mostrarResultados = true;

      const timeNow = new Date().getTime();
      const respuesta = await this.productService.searchProducts(textoBusqueda, timeNow).toPromise();
      
      this.productos = respuesta.products || [];
      
      // Guardar en búsquedas recientes
      this.guardarBusquedaReciente(textoBusqueda);
      
    } catch (error) {
      console.error('Error al buscar productos:', error);
    } finally {
      this.cargando = false;
      this.buscando = false;
    }
  }

  seleccionarBusquedaReciente(texto: string) {
    this.textoBusqueda = texto;
    this.buscarProductos();
  }

  limpiarBusqueda() {
    this.textoBusqueda = '';
    this.productos = [];
    this.mostrarResultados = false;
  }

  volver() {
    this.router.navigate(['/tabs/home']);
  }

  irAProducto(producto: Product) {
    this.router.navigate(['/product-detail', producto.slug]);
  }
}