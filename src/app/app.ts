import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { LayoutState } from './core/layout/layout-state';
import { Icon } from './shared/ui/icon';

// Enlaces del pie: el canal y el código del proyecto.
const CHANNEL_URL = 'https://www.youtube.com/channel/UCOwIey0vGlYkZBgF29ASn3A';
const GITHUB_URL = 'https://github.com/AguiCode7';

// Secciones de la app (encabezado en escritorio y barra inferior en el móvil).
const SECTIONS = [
  { path: '/', label: 'Hoy', icon: 'today', exact: true },
  { path: '/archive', label: 'Archivo', icon: 'archive', exact: false },
  { path: '/saved', label: 'Guardadas', icon: 'bookmark', exact: false },
] as const;

// Componente raíz: encabezado, página actual, pie y navegación móvil.
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, RouterOutlet, Icon],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  protected readonly layout = inject(LayoutState);

  protected readonly sections = SECTIONS;
  protected readonly channelUrl = CHANNEL_URL;
  protected readonly githubUrl = GITHUB_URL;
  protected readonly year = new Date().getFullYear();

  // El buscador del encabezado lleva al archivo con la búsqueda aplicada.
  protected search(event: SubmitEvent, term: string): void {
    event.preventDefault();
    const q = term.trim();
    void this.router.navigate(['/archive'], {
      queryParams: q ? { q } : {},
    });
  }
}
