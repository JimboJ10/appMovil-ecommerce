import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
  },
  {
    path: 'product-detail/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage),
  },
  {
    path: 'product-list',
    loadComponent: () => import('./pages/product-list/product-list.page').then(m => m.ProductListPage),
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.page').then(m => m.SearchPage),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage),
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.page').then(m => m.OrdersPage),
  },
  {
    path: 'order-detail/:id',
    loadComponent: () => import('./pages/order-detail/order-detail.page').then(m => m.OrderDetailPage),
  },
  {
    path: 'addresses',
    loadComponent: () => import('./pages/addresses/addresses.page').then(m => m.AddressesPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
  },
  {
    path: 'reviews/:id',
    loadComponent: () => import('./pages/reviews/reviews.page').then(m => m.ReviewsPage),
  },
  {
    path: '**',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },
];