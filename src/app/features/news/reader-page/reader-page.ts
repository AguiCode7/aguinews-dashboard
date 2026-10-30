import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LayoutState } from '../../../core/layout/layout-state';
import { ReadingState } from '../../../core/reading/reading-state';
import { ChannelApi } from '../../channel/data/channel-api';
import { normalizeUrl } from '../../channel/data/video';
import { Icon } from '../../../shared/ui/icon';
import { toParagraphs } from '../data/article';
import { NewsApi } from '../data/news-api';

const NOT_FOUND = 404;
// Cuánto dura visible el aviso de "Enlace copiado".
const COPIED_MESSAGE_MS = 2500;

// Modo lectura: la lectura en español de una noticia, su índice y el enlace al original.
@Component({
  selector: 'app-reader-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './reader-page.html',
  host: { '(window:scroll)': 'updateProgress()' },
})
export class ReaderPage {
  private readonly api = inject(NewsApi);
  private readonly title = inject(Title);
  protected readonly reading = inject(ReadingState);
  private readonly layout = inject(LayoutState);

  // Llega desde la ruta /articles/:id
  readonly id = input.required<string>();

  protected readonly article = this.api.article(this.id);
  private readonly summaryId = computed(() =>
    this.article.hasValue() ? this.article.value().summaryId : undefined,
  );
  protected readonly edition = this.api.edition(this.summaryId);

  // Short del canal hecho con esta noticia (si existe).
  private readonly shorts = inject(ChannelApi).shortsByNews();
  protected readonly short = computed(() =>
    this.article.hasValue()
      ? this.shorts().get(normalizeUrl(this.article.value().url))
      : undefined,
  );

  protected readonly paragraphs = computed(() =>
    this.article.hasValue() ? toParagraphs(this.article.value().reading) : [],
  );

  protected readonly siblings = computed(() =>
    this.edition.hasValue() ? this.edition.value().articles : [],
  );

  protected readonly index = computed(() =>
    this.siblings().findIndex((a) => a.id === this.id()),
  );

  protected readonly previous = computed(() =>
    this.index() > 0 ? this.siblings()[this.index() - 1] : undefined,
  );

  protected readonly next = computed(() => {
    const index = this.index();
    return index >= 0 ? this.siblings()[index + 1] : undefined;
  });

  protected readonly notFound = computed(() => {
    const error = this.article.error();
    return error instanceof HttpErrorResponse && error.status === NOT_FOUND;
  });

  // Porcentaje de la página recorrido, para la barra superior.
  protected readonly progress = signal(0);
  protected readonly progressRounded = computed(() =>
    Math.round(this.progress()),
  );
  protected readonly copied = signal(false);

  constructor() {
    // En el móvil, la lectura ocupa toda la pantalla (sin la barra de secciones).
    this.layout.immersive.set(true);
    inject(DestroyRef).onDestroy(() => this.layout.immersive.set(false));

    // Al abrir una noticia: cuenta como leída y la pestaña muestra su título.
    effect(() => {
      if (this.article.hasValue()) {
        const article = this.article.value();
        this.reading.markRead(article.id);
        this.title.setTitle(`${article.title} · AguiNews`);
      }
    });

    // Al pasar a otra noticia, la barra de progreso vuelve a cero.
    effect(() => {
      this.id();
      this.progress.set(0);
    });
  }

  protected updateProgress(): void {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    this.progress.set(
      scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0,
    );
  }

  protected toggleSaved(): void {
    if (this.article.hasValue()) {
      this.reading.toggleSaved(this.article.value());
    }
  }

  protected async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), COPIED_MESSAGE_MS);
    } catch {
      // Sin permiso para el portapapeles: no se muestra el aviso.
    }
  }
}
