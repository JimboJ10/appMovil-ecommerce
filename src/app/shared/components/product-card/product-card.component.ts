import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showDiscount: boolean = true;

  constructor(private router: Router) {}

  viewProduct() {
    // 🔴 AGREGAR LOG PARA DEBUG
    console.log('🔍 Navegando a producto:', this.product.slug);
    
    if (!this.product.slug) {
      console.error('❌ El producto no tiene slug:', this.product);
      return;
    }
    
    this.router.navigate(['/product-detail', this.product.slug]);
  }

  get hasDiscount(): boolean {
    return this.product.campaing_discount !== null && this.product.campaing_discount !== undefined;
  }

  get discountedPrice(): number {
    if (!this.hasDiscount || !this.product.campaing_discount) {
      return this.product.price_usd;
    }

    const discount = this.product.campaing_discount;
    if (discount.type_discount === 1) {
      return this.product.price_usd - (this.product.price_usd * discount.discount / 100);
    } else {
      return this.product.price_usd - discount.discount;
    }
  }

  get discountPercentage(): number {
    if (!this.hasDiscount || !this.product.campaing_discount) {
      return 0;
    }

    const discount = this.product.campaing_discount;
    if (discount.type_discount === 1) {
      return discount.discount;
    } else {
      return Math.round((discount.discount / this.product.price_usd) * 100);
    }
  }
}