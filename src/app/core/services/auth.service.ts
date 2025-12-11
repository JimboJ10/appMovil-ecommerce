import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginResponse } from '../models/user.model';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
    const user = await this.storage.get('user');
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/users/login`, { email, password })
      .pipe(
        tap(async (response) => {
          await this.storage.set('token', response.token);
          await this.storage.set('user', response.user);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(userData: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/register`, userData);
  }

  async logout() {
    await this.storage.remove('token');
    await this.storage.remove('user');
    this.currentUserSubject.next(null);
  }

  async getToken(): Promise<string | null> {
    return await this.storage.get('token');
  }

  async getCurrentUser(): Promise<User | null> {
    return await this.storage.get('user');
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  updateUser(user: User) {
    this.currentUserSubject.next(user);
    this.storage.set('user', user);
  }
}