import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
  signal,
} from '@angular/core';
import { Icon } from '../../shared/ui/icon';
import { InstallPrompt } from '../pwa/install-prompt';
import { detectStorageHint, StorageHint } from '../pwa/storage-hint';
import { LayoutState } from './layout-state';

// Se recuerda cerrado en este navegador para no insistir en cada visita.
const DISMISS_KEY = 'aguinews.installHint';
const DISMISSED_VALUE = 'dismissed';
// Destino del foco al cerrar, para que el teclado no quede en el aire.
const MAIN_ID = 'main';
// Sin dato de pantalla táctil se asume que no la hay.
const NO_TOUCH = 0;

const MESSAGES: Record<StorageHint, string> = {
  'in-app':
    'Estás en el navegador de una app: tu progreso puede borrarse. Ábrelo en tu navegador para no perderlo.',
  'ios-safari':
    'En Safari tu progreso se borra si no entras en 7 días. Instálalo: Compartir → Agregar a inicio.',
  install: 'Instala AguiNews para proteger tu progreso y abrirla con un toque.',
};

// Aviso discreto sobre dónde se guarda el progreso y cómo no perderlo.
// Va dentro del flujo (no flota): no tapa la barra inferior ni el contenido.
@Component({
  selector: 'app-install-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './install-hint.html',
})
export class InstallHint {
  private readonly document = inject(DOCUMENT);
  private readonly layout = inject(LayoutState);
  private readonly installer = inject(InstallPrompt);
  private readonly dismissed = signal(isDismissed());

  protected readonly hint = computed(() => {
    const navigator = this.document.defaultView?.navigator;
    return detectStorageHint({
      userAgent: navigator?.userAgent ?? '',
      platform: navigator?.platform ?? '',
      maxTouchPoints: navigator?.maxTouchPoints ?? NO_TOUCH,
      standalone: this.installer.standalone(),
      canInstall: this.installer.canInstall(),
    });
  });

  // En el modo lectura no se muestra: esa pantalla es solo para leer.
  protected readonly visible = computed(
    () => this.hint() !== null && !this.dismissed() && !this.layout.immersive(),
  );

  protected readonly message = computed(() => {
    const hint = this.hint();
    return hint ? MESSAGES[hint] : '';
  });

  protected dismiss(): void {
    this.dismissed.set(true);
    try {
      localStorage.setItem(DISMISS_KEY, DISMISSED_VALUE);
    } catch {
      // Sin almacenamiento: queda cerrado solo durante esta visita.
    }
    this.focusMain();
  }

  protected async install(): Promise<void> {
    await this.installer.install();
    // Tras el diálogo del navegador el aviso desaparece: el foco pasa al contenido.
    this.focusMain();
  }

  private focusMain(): void {
    this.document.getElementById(MAIN_ID)?.focus();
  }
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === DISMISSED_VALUE;
  } catch {
    return false;
  }
}
