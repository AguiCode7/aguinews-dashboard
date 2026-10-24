import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReadingState } from '../../../core/reading/reading-state';
import { HighlightPipe } from '../../../shared/pipes/highlight.pipe';
import { Icon } from '../../../shared/ui/icon';
import { NewsApi } from '../data/news-api';
import { parseNewsItems } from '../data/news-item';
import { ArticleItem, Summary } from '../data/summary';
import { TOPICS } from '../data/topics';

// Ediciones que carga el archivo (el máximo que acepta la API por consulta).
const ARCHIVE_SIZE = 50;
// Con menos letras, resaltar ensucia los titulares.
const MIN_HIGHLIGHT_LENGTH = 3;

// Noticia del archivo junto con la fecha de su edición.
interface ArchiveArticle extends ArticleItem {
  editionDate: string;
}

// Archivo: todas las ediciones, con buscador y filtro por tema.
@Component({
  selector: 'app-archive-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, HighlightPipe, Icon],
  templateUrl: './archive-page.html',
})
export class ArchivePage {
  private readonly api = inject(NewsApi);
  private readonly router = inject(Router);
  protected readonly reading = inject(ReadingState);

  // Llegan desde la URL (?q=…&topic=…) para que la búsqueda se pueda compartir.
  readonly q = input<string>();
  readonly topic = input<string>();

  protected readonly topics = TOPICS;
  protected readonly editions = this.api.latestEditions(signal(ARCHIVE_SIZE));

  // El buscador se edita en la página y arranca con lo que trae la URL.
  protected readonly search = linkedSignal(() => this.q() ?? '');

  protected readonly isFiltering = computed(
    () => this.search().trim().length > 0 || !!this.topic(),
  );

  protected readonly highlightTerm = computed(() => {
    const term = this.search().trim();
    return term.length >= MIN_HIGHLIGHT_LENGTH ? term : '';
  });

  // value() lanza un error si el recurso falló: se lee solo cuando hay valor.
  protected readonly editionList = computed(() =>
    this.editions.hasValue() ? this.editions.value() : [],
  );

  private readonly allArticles = computed<ArchiveArticle[]>(() =>
    this.editionList().flatMap((e) =>
      e.articles.map((a) => ({ ...a, editionDate: e.createdAt })),
    ),
  );

  protected readonly results = computed(() => {
    const term = this.search().trim().toLowerCase();
    const topic = this.topic();
    return this.allArticles().filter(
      (a) =>
        (!topic || a.topic === topic) &&
        (!term ||
          [a.title, a.headline, a.topic, a.sourceName].some((text) =>
            text.toLowerCase().includes(term),
          )),
    );
  });

  protected headlinesOf(edition: Summary): string[] {
    return edition.articles.length
      ? edition.articles.map((a) => a.title)
      : parseNewsItems(edition.content).map((item) => item.headline);
  }

  protected readCountOf(edition: Summary): number {
    return edition.articles.filter((a) => this.reading.isRead(a.id)).length;
  }

  protected selectTopic(topic: string | undefined): void {
    void this.router.navigate([], {
      queryParams: { topic: topic === this.topic() ? null : topic },
      queryParamsHandling: 'merge',
    });
  }

  protected clear(): void {
    this.search.set('');
    void this.router.navigate([], { queryParams: {} });
  }
}
