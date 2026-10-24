import { Service, signal } from '@angular/core';

// Estado compartido del marco de la app. El modo lectura oculta la barra inferior del móvil.
@Service()
export class LayoutState {
  readonly immersive = signal(false);
}
