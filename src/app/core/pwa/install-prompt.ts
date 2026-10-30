import { DestroyRef, inject, Service, signal } from '@angular/core';

// El evento no está en los tipos del DOM (solo existe en Chromium).
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STANDALONE_QUERY = '(display-mode: standalone)';

// Guarda la oferta de instalación de Chrome/Edge/Android para lanzarla desde un botón.
@Service()
export class InstallPrompt {
  private deferred: BeforeInstallPromptEvent | null = null;
  private readonly available = signal(false);
  private readonly installed = signal(isStandalone());

  readonly canInstall = this.available.asReadonly();
  readonly standalone = this.installed.asReadonly();

  constructor() {
    if (typeof window === 'undefined') return;
    const onPrompt = (event: Event) => {
      // Sin preventDefault el navegador muestra su propio aviso y se pierde el evento.
      event.preventDefault();
      this.deferred = event as BeforeInstallPromptEvent;
      this.available.set(true);
    };
    const onInstalled = () => {
      this.deferred = null;
      this.available.set(false);
      this.installed.set(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    });
  }

  // El evento solo puede usarse una vez: después de mostrarlo se descarta.
  async install(): Promise<boolean> {
    const event = this.deferred;
    if (!event) return false;
    this.deferred = null;
    this.available.set(false);
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }
}

// En iOS, la app instalada se reconoce por navigator.standalone.
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const iosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return (
    iosStandalone || (window.matchMedia?.(STANDALONE_QUERY).matches ?? false)
  );
}
