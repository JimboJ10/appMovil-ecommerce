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
  
  // 🔴 Flag para saber si ya se inicializó
  private initialized = false;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.initializeAuth();
  }

  // 🔴 MÉTODO PARA INICIALIZAR AUTENTICACIÓN
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

      console.log('🔐 Token recuperado:', token ? 'SÍ' : 'NO');
      console.log('👤 Usuario recuperado:', user ? user.email : 'NO');

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
          console.log('✅ Login exitoso, guardando datos...');
          
          await Promise.all([
            this.storage.set('token', response.token),
            this.storage.set('user', response.user)
          ]);

          console.log('💾 Token guardado:', response.token.substring(0, 20) + '...');
          console.log('💾 Usuario guardado:', response.user.email);

          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(userData: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/register`, userData);
  }

  async logout() {
    console.log('👋 Cerrando sesión...');
    
    await Promise.all([
      this.storage.remove('token'),
      this.storage.remove('user')
    ]);
    
    this.currentUserSubject.next(null);
    console.log('✅ Sesión cerrada');
  }

  async getToken(): Promise<string | null> {
    // Esperar a que se inicialice
    if (!this.initialized) {
      await this.initializeAuth();
    }
    
    const token = await this.storage.get('token');
    console.log('🔑 Token solicitado:', token ? 'EXISTE' : 'NO EXISTE');
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
}