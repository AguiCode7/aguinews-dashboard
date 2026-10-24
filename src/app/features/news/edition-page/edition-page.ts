import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReadingState } from '../../../core/reading/reading-state';
import { Icon } from '../../../shared/ui/icon';
import { ArticleCard } from '../article-card/article-card';
import { NewsApi } from '../data/news-api';
import { parseNewsItems } from '../data/news-item';
import { Summary } from '../data/summary';

// Ediciones que se piden para la columna de "Ediciones anteriores".
const RECENT_EDITIONS = 10;
const EARLIER_SHOWN = 4;
const NOT_FOUND = 404;

// Portada de una edición: la de hoy (sin id) o una anterior (/editions/:id).
@Component({
  selector: 'app-edition-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, ArticleCard, Icon],
  templateUrl: './edition-page.html',
})
export class EditionPage {
  private readonly api = inject(NewsApi);
  protected readonly reading = inject(ReadingState);

  // Llega desde la ruta /editions/:id; en la portada no viene.
  readonly id = input<string>();

  protected readonly recent = this.api.latestEditions(signal(RECENT_EDITIONS));
  protected readonly selected = this.api.edition(this.id);

  // value() lanza un error si el recurso falló: se lee solo cuando hay valor.
  private readonly recentEditions = computed(() =>
    this.recent.hasValue() ? this.recent.value() : [],
  );

  // La edición que se muestra: la pedida por id o la más reciente.
  protected readonly edition = computed<Summary | undefined>(() => {
    if (this.id()) {
      return this.selected.hasValue() ? this.selected.value() : undefined;
    }
    return this.recentEditions()[0];
  });

  protected readonly isLoading = computed(() =>
    this.id() ? this.selected.isLoading() : this.recent.isLoading(),
  );

  protected readonly error = computed(() =>
    this.id() ? this.selected.error() : this.recent.error(),
  );

  protected readonly notFound = computed(() => {
    const error = this.error();
    return error instanceof HttpErrorResponse && error.status === NOT_FOUND;
  });

  protected readonly isToday = computed(() => {
    const edition = this.edition();
    return (
      !!edition &&
      new Date(edition.createdAt).toDateString() === new Date().toDateString()
    );
  });

  protected readonly articles = computed(() => this.edition()?.articles ?? []);

  // Ediciones de antes del video 4: solo traen el texto con una noticia por línea.
  protected readonly legacyItems = computed(() => {
    const edition = this.edition();
    return edition && edition.articles.length === 0
      ? parseNewsItems(edition.content)
      : [];
  });

  protected readonly readCount = computed(
    () => this.articles().filter((a) => this.reading.isRead(a.id)).length,
  );

  protected readonly totalMinutes = computed(() =>
    this.articles().reduce((sum, a) => sum + a.readingMinutes, 0),
  );

  // La destacada es la primera sin leer: así la portada siempre propone qué sigue.
  protected readonly featured = computed(() => {
    const articles = this.articles();
    return articles.find((a) => !this.reading.isRead(a.id)) ?? articles[0];
  });

  protected readonly others = computed(() =>
    this.articles().filter((a) => a !== this.featured()),
  );

  protected readonly earlier = computed(() =>
    this.recentEditions()
      .filter((e) => e.id !== this.edition()?.id)
      .slice(0, EARLIER_SHOWN),
  );

  // Temas presentes en las ediciones recientes, para explorar el archivo.
  protected readonly topics = computed(() => [
    ...new Set(
      this.recentEditions().flatMap((e) => e.articles.map((a) => a.topic)),
    ),
  ]);

  protected readCountOf(edition: Summary): number {
    return edition.articles.filter((a) => this.reading.isRead(a.id)).length;
  }

  protected firstHeadline(edition: Summary): string {
    return (
      edition.articles[0]?.title ??
      parseNewsItems(edition.content)[0]?.headline ??
      ''
    );
  }

  protected retry(): void {
    if (this.id()) {
      this.selected.reload();
    } else {
      this.recent.reload();
    }
  }
}
