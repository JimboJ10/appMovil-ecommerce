import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, grid, cart, person } from 'ionicons/icons';
import { CartService } from '../core/services/cart.service';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  cartCount$: Observable<number>;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {
    addIcons({ home, grid, cart, person });
    this.cartCount$ = this.cartService.cartCount$;
  }

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.cartService.getCartItems(user._id!).subscribe();
    }
  }
}