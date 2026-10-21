import {
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { SummaryApi } from '../data/summary-api';
import { Summary } from '../data/summary';
import { EditionCard } from '../edition-card/edition-card';

// Cuántas ediciones se piden por vez, y el máximo que acepta la API.
const PAGE_SIZE = 10;
const MAX_EDITIONS = 50;
// Con menos letras, resaltar ensucia los titulares (una sola "p" aparece en todos).
const MIN_HIGHLIGHT_LENGTH = 3;

// Portada: la edición más reciente en grande y las anteriores debajo.
@Component({
  selector: 'app-edition-list',
  imports: [EditionCard],
  templateUrl: './edition-list.html',
})
export class EditionList {
  private readonly summaryApi = inject(SummaryApi);

  protected readonly count = signal(PAGE_SIZE);
  protected readonly search = signal('');

  // Se vuelve a pedir a la API cada vez que cambia `count`.
  protected readonly summaries = this.summaryApi.latest(this.count);

  // Mientras llega una página nueva, seguimos mostrando la anterior (sin parpadeo).
  protected readonly editions = linkedSignal<
    { value: Summary[]; loading: boolean },
    Summary[]
  >({
    source: () => ({
      value: this.summaries.hasValue() ? this.summaries.value() : [],
      loading: this.summaries.isLoading(),
    }),
    computation: (next, previous) =>
      next.loading && previous ? previous.value : next.value,
  });

  protected readonly lead = computed(() => this.editions()[0]);

  // El buscador filtra las ediciones anteriores en el navegador, sin llamar a la API.
  protected readonly earlier = computed(() => {
    const term = this.search().trim().toLowerCase();
    const rest = this.editions().slice(1);
    return term
      ? rest.filter((s) => s.content.toLowerCase().includes(term))
      : rest;
  });

  protected readonly highlightTerm = computed(() => {
    const term = this.search().trim();
    return term.length >= MIN_HIGHLIGHT_LENGTH ? term : '';
  });

  protected readonly canLoadMore = computed(
    () => this.editions().length >= this.count() && this.count() < MAX_EDITIONS,
  );

  protected loadMore(): void {
    this.count.update((value) => Math.min(value + PAGE_SIZE, MAX_EDITIONS));
  }

  protected clearSearch(): void {
    this.search.set('');
  }

  protected retry(): void {
    this.summaries.reload();
  }
}
