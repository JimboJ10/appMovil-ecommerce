import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { IonicStorageModule, Storage } from '@ionic/storage-angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';

// Registrar iconos globalmente
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

const icons = Object.keys(allIcons).reduce((acc: any, key) => {
  acc[key] = (allIcons as any)[key];
  return acc;
}, {});
addIcons(icons);

console.log('🚀 Iniciando bootstrap...');

// 🔴 FUNCIÓN PARA INICIALIZAR STORAGE
export function initializeStorage(storage: Storage) {
  return () => storage.create();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md',
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    importProvidersFrom(IonicStorageModule.forRoot()),
    // 🔴 INICIALIZAR STORAGE ANTES DE LA APP
    {
      provide: APP_INITIALIZER,
      useFactory: initializeStorage,
      deps: [Storage],
      multi: true
    }
  ],
})
.then(() => console.log('✅ App iniciada correctamente'))
.catch(err => {
  console.error('❌ ERROR AL INICIAR:', err);
  alert('Error al cargar la app: ' + err.message);
});