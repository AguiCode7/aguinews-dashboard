import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerServiceWorker } from './app/core/pwa/service-worker';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

// Solo en producción: en desarrollo un service worker serviría versiones viejas.
if (!isDevMode()) registerServiceWorker();
