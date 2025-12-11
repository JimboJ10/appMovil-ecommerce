import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastController = inject(ToastController);

  return next(req).pipe(
    catchError(async (error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        if (error.status === 401 || error.status === 403) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          router.navigate(['/auth/login']);
        } else if (error.status === 404) {
          errorMessage = 'Recurso no encontrado';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
      }

      // Mostrar toast con el error
      const toast = await toastController.create({
        message: errorMessage,
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();

      return throwError(() => error);
    })
  );
};