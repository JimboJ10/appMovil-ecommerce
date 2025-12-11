import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAddresses(userId: string): Observable<{ address_client: Address[] }> {
    return this.http.get<{ address_client: Address[] }>(`${this.apiUrl}/address_client/list?user_id=${userId}`);
  }

  createAddress(address: Address): Observable<any> {
    return this.http.post(`${this.apiUrl}/address_client/register`, address);
  }

  updateAddress(address: Address): Observable<any> {
    return this.http.put(`${this.apiUrl}/address_client/update`, address);
  }

  deleteAddress(addressId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/address_client/delete/${addressId}`);
  }
}