import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, from, switchMap } from 'rxjs';
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
  
  private initialized = false;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    if (this.initialized) return;

    try {
      // Asegurar que storage esté listo
      await this.storage.create();
      
      // Cargar usuario y token guardados
      const [token, user] = await Promise.all([
        this.storage.get('token'),
        this.storage.get('user')
      ]);

      if (token && user) {
        this.currentUserSubject.next(user);
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Error al inicializar auth:', error);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/users/login`, { email, password })
      .pipe(
        tap(async (response) => {
          
          await Promise.all([
            this.storage.set('token', response.token),
            this.storage.set('user', response.user)
          ]);

          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(userData: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/register`, userData);
  }

  async logout() {
    
    await Promise.all([
      this.storage.remove('token'),
      this.storage.remove('user')
    ]);
    
    this.currentUserSubject.next(null);
  }

  async getToken(): Promise<string | null> {
    // Esperar a que se inicialice
    if (!this.initialized) {
      await this.initializeAuth();
    }
    
    const token = await this.storage.get('token');
    return token;
  }

  async getCurrentUser(): Promise<User | null> {
    // Esperar a que se inicialice
    if (!this.initialized) {
      await this.initializeAuth();
    }

    // Primero intentar obtener del BehaviorSubject
    if (this.currentUserSubject.value) {
      return this.currentUserSubject.value;
    }

    // Si no está en memoria, obtener del storage
    const user = await this.storage.get('user');
    if (user) {
      this.currentUserSubject.next(user);
    }
    
    return user;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  async updateUser(user: User) {
    this.currentUserSubject.next(user);
    await this.storage.set('user', user);
  }

  changePassword(userId: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/change-password`, {
      user_id: userId,
      current_password: currentPassword,
      new_password: newPassword
    });
  }
}