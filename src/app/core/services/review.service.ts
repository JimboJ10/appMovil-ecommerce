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

  createReview(review: Review): Observable<any> {
    return this.http.post(`${this.apiUrl}/review/register`, review);
  }

  updateReview(review: Review): Observable<any> {
    return this.http.put(`${this.apiUrl}/review/update`, review);
  }
}