import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Cart, CartSummary } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = environment.apiUrl;
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCartItems(userId: string): Observable<{ carts: Cart[] }> {
    return this.http.get<{ carts: Cart[] }>(`${this.apiUrl}/cart/list?user_id=${userId}`)
      .pipe(
        tap(response => {
          this.cartCountSubject.next(response.carts.length);
        })
      );
  }

  addToCart(cartData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/register`, cartData)
      .pipe(
        tap(() => {
          this.cartCountSubject.next(this.cartCountSubject.value + 1);
        })
      );
  }

  updateCartItem(cartData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cart/update`, cartData);
  }

  removeCartItem(cartId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/delete/${cartId}`)
      .pipe(
        tap(() => {
          this.cartCountSubject.next(Math.max(0, this.cartCountSubject.value - 1));
        })
      );
  }

  applyCoupon(code: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/aplicar_cupon`, { code, user_id: userId });
  }

  calculateCartSummary(carts: Cart[]): CartSummary {
    const subtotal = carts.reduce((sum, item) => sum + item.subtotal, 0);
    const total = carts.reduce((sum, item) => sum + item.total, 0);
    const discount = subtotal - total;
    
    return {
      subtotal,
      discount,
      total,
      items: carts.length
    };
  }

  clearCart() {
    this.cartCountSubject.next(0);
  }
}