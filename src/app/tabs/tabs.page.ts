import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, grid, cart, person, logIn } from 'ionicons/icons';
import { CartService } from '../core/services/cart.service';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  cartCount$: Observable<number>;
  isAuthenticated: boolean = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ home, grid, cart, person, logIn });
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

  async ionViewWillEnter() {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  handleCartClick() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
    }
  }

  handleProfileClick() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
    }
  }
}