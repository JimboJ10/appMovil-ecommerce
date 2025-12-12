import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage),
        canActivate: [noAuthGuard]
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage),
        canActivate: [noAuthGuard]
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
        canActivate: [noAuthGuard]
      }
    ]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'product-detail/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage),
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.page').then(m => m.SearchPage),
  },
  {
    path: 'addresses',
    loadComponent: () => import('./pages/addresses/addresses.page').then(m => m.AddressesPage),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.page').then(m => m.OrdersPage),
    canActivate: [authGuard]
  },
  {
    path: 'order-detail/:id',
    loadComponent: () => import('./pages/order-detail/order-detail.page').then(m => m.OrderDetailPage),
    canActivate: [authGuard]
  },
  {
    path: 'product-list',
    loadComponent: () => import('./pages/product-list/product-list.page').then(m => m.ProductListPage)
  },
  {
    path: 'reviews/:id',
    loadComponent: () => import('./pages/reviews/reviews.page').then(m => m.ReviewsPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
    canActivate: [authGuard]
  },
];