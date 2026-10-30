// Ruta del service worker propio (public/sw.js), en la raíz para controlar todo el sitio.
const SERVICE_WORKER_URL = '/sw.js';

// Se registra después de la carga para no competir con la primera pintura.
export function registerServiceWorker(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  const register = () => {
    navigator.serviceWorker.register(SERVICE_WORKER_URL).catch(() => {
      // Sin service worker el sitio funciona igual; solo pierde el respaldo sin conexión.
    });
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
