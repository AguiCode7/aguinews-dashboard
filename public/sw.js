// Service worker mínimo de AguiNews: hace la app instalable y abre el sitio
// sin conexión con la última página guardada. No usa @angular/service-worker.
//  - Navegación: primero la red (siempre la versión más nueva) y, si falla, el index en caché.
//  - /api/ y el resto (JS, CSS, imágenes): no se tocan; los cubre la caché HTTP de nginx.

// Súbela cuando cambie lo que se guarda: el activate borra las cachés anteriores.
const CACHE_VERSION = 'v1';
const CACHE_PREFIX = 'aguinews-shell-';
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
// Todas las rutas de la SPA responden con el mismo index.html.
const SHELL_URL = '/';
const API_PATH_PREFIX = '/api/';
const HTML_CONTENT_TYPE = 'text/html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.add(SHELL_URL))
      // Si falla (sin red al instalar), el index se guardará en la próxima navegación.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isNavigation =
    request.method === 'GET' &&
    request.mode === 'navigate' &&
    url.origin === self.location.origin &&
    !url.pathname.startsWith(API_PATH_PREFIX);
  // Lo que no es navegación sigue su camino normal (sin respondWith).
  if (!isNavigation) return;
  event.respondWith(networkFirst(event));
});

async function networkFirst(event) {
  const { request } = event;
  try {
    const response = await fetch(request);
    const isHtml = (response.headers.get('content-type') ?? '').includes(
      HTML_CONTENT_TYPE,
    );
    if (response.ok && isHtml) {
      // Se guarda en segundo plano para no retrasar la respuesta.
      const copy = response.clone();
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.put(SHELL_URL, copy)),
      );
    }
    return response;
  } catch (error) {
    const cached = await caches.match(SHELL_URL);
    if (cached) return cached;
    throw error;
  }
}
