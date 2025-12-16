import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createReview(review: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/review/register`, review);
  }

  updateReview(review: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/review/update`, review);
  }

  // 🔴 NUEVO: Obtener reseñas de un producto
  getProductReviews(productId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/review/list?product_id=${productId}`);
  }

  // 🔴 NUEVO: Verificar si el usuario puede dejar reseña
  checkCanReview(userId: string, productId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/review/check?user_id=${userId}&product_id=${productId}`);
  }
}