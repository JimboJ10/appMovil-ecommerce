import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sale/register`, orderData);
  }

  getMyOrders(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/home/profile_client`, { user_id: userId });
  }

  getOrderDetail(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sale/show/${orderId}`);
  }
}