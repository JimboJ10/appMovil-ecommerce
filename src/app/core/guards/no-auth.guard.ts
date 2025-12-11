import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = await authService.getToken();

  if (!token) {
    return true;
  }

  router.navigate(['/tabs/home']);
  return false;
};