import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return from(authService.getToken()).pipe(
    switchMap(token => {
      console.log('🔐 Interceptor - Token:', token ? 'EXISTE' : 'NO EXISTE');

      if (token) {
        // 🔴 AGREGAR HEADER Authorization con formato Bearer
        const clonedReq = req.clone({
          setHeaders: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Request con token:', clonedReq.url);
        return next(clonedReq);
      }

      return next(req);
    })
  );
};