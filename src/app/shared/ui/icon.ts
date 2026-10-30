import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

// Trazos de los íconos (24×24, línea). Se pintan con el color del texto.
const PATHS = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  'chevron-right': 'M9 6l6 6-6 6',
  external: 'M7 17L17 7M9 7h8v8',
  bookmark: 'M6 3h12v18l-6-4-6 4z',
  check: 'M5 13l4 4L19 7',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  today: 'M4 5h16v14H4zM8 9h8M8 13h5',
  archive: 'M4 7h16v12H4zM3 4h18v3H3zM10 11h4',
  sparkle: 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
  play: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM10 9v6l5-3z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  close: 'M6 6l12 12M18 6L6 18',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  upload: 'M12 15V4M7 9l5-5 5 5M5 20h14',
  install: 'M7 3h10v18H7zM12 7v7M9.5 11.5L12 14l2.5-2.5M11 18h2',
} as const;

export type IconName = keyof typeof PATHS;

// Ícono decorativo: el texto del botón o un aria-label dicen qué hace.
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    [attr.stroke-width]="stroke()"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path [attr.d]="path()" />
  </svg>`,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly stroke = input(2);

  protected readonly path = computed(() => PATHS[this.name()]);
}
