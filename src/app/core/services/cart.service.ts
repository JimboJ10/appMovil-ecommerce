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

  // 🔴 NUEVO: Método para obtener el carrito del usuario actual
  async getCart(): Promise<{ carts: Cart[] }> {
    try {
      console.log('📡 Obteniendo carrito desde el servicio...');
      
      // NO necesitamos enviar user_id porque el backend lo obtiene del token
      const response = await this.http.get<{ carts: Cart[] }>(
        `${this.apiUrl}/cart/list`
      ).toPromise();
      
      console.log('✅ Carrito obtenido:', response?.carts.length || 0, 'items');
      
      return response || { carts: [] };
      
    } catch (error) {
      console.error('❌ Error al obtener carrito:', error);
      return { carts: [] };
    }
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

  // 🔴 NUEVO: Verificar si un producto ya está en el carrito
  async checkProductInCart(productId: string, variedadId?: string): Promise<Cart | null> {
    try {
      const response = await this.getCart();
      
      if (!response || !response.carts) {
        return null;
      }
  
      console.log('🔍 Verificando producto en carrito...');
      console.log('  - Producto ID:', productId);
      console.log('  - Variedad ID:', variedadId);
      console.log('  - Total items en carrito:', response.carts.length);
  
      // Buscar si el producto ya existe en el carrito
      const existingCart = response.carts.find((cart: Cart) => {
        const matchProduct = cart.product._id === productId;
        
        // Si el producto tiene variedad, validar que coincida
        if (variedadId) {
          const cartVariedadId = typeof cart.variedad === 'object' 
            ? cart.variedad._id 
            : cart.variedad;
          
          return matchProduct && cartVariedadId === variedadId;
        }
        
        // Si no tiene variedad, solo validar el producto
        return matchProduct && !cart.variedad;
      });
  
      if (existingCart) {
        console.log('⚠️ Producto ya existe en el carrito');
      } else {
        console.log('✅ Producto NO existe en el carrito');
      }
  
      return existingCart || null;
    } catch (error) {
      console.error('❌ Error al verificar producto en carrito:', error);
      return null;
    }
  }

  clearCart() {
    this.cartCountSubject.next(0);
  }
}