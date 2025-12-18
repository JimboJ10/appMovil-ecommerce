import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar a obtener el token
  const token = await authService.getToken();

  if (token) {
    return true;
  }
  router.navigate(['/auth/login']);
  return false;
};