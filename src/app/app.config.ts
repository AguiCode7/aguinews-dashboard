import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-419';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';

// Fechas y números en español.
registerLocaleData(localeEs);

// HttpClient ya viene incluido desde Angular 21: no hace falta registrarlo.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(), // los parámetros de la ruta llegan como input()
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    { provide: LOCALE_ID, useValue: 'es-419' },
  ],
};
