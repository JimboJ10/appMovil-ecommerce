import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHomeProducts(timeNow: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/home/list?TIME_NOW=${timeNow}`);
  }

  getProductDetail(slug: string, discountId?: string): Observable<any> {
    let params = new HttpParams();
    if (discountId) {
      params = params.set('_id', discountId);
    }
    return this.http.get(`${this.apiUrl}/home/landing-product/${slug}`, { params });
  }

  searchProducts(searchText: string, timeNow: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/home/search_product?TIME_NOW=${timeNow}`, {
      search_product: searchText
    });
  }

  filterProducts(filters: any, timeNow: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/home/filter_products?TIME_NOW=${timeNow}`, filters);
  }

  getConfigInitial(): Observable<any> {
    return this.http.get(`${this.apiUrl}/home/config_initial`);
  }
}