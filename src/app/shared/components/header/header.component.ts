import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HeaderComponent implements OnInit {
  @Input() title: string = '';
  @Input() showBackButton: boolean = false;
  @Input() showCartButton: boolean = true;
  @Input() showSearchButton: boolean = false;
  
  cartCount$: Observable<number>;
  isAuthenticated: boolean = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.cartCount$ = this.cartService.cartCount$;
  }

  async ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (this.isAuthenticated) {
      const user = await this.authService.getCurrentUser();
      if (user) {
        this.cartService.getCartItems(user._id!).subscribe();
      }
    }
  }

  goBack() {
    window.history.back();
  }

  goToCart() {
    if (this.isAuthenticated) {
      this.router.navigate(['/tabs/cart']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }
}