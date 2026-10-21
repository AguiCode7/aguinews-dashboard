import { DatePipe, formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  afterRenderEffect,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  signal,
  viewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { parseNewsItems } from '../data/news-item';
import { SummaryApi } from '../data/summary-api';

const NOT_FOUND = 404;
// Ediciones que se consultan para enlazar la anterior y la siguiente.
const NEIGHBOR_WINDOW = 50;

// Página de lectura de una edición: todas sus noticias con su enlace.
@Component({
  selector: 'app-edition-detail',
  imports: [DatePipe, RouterLink, RelativeTimePipe],
  templateUrl: './edition-detail.html',
})
export class EditionDetail {
  private readonly summaryApi = inject(SummaryApi);
  private readonly title = inject(Title);
  private readonly locale = inject(LOCALE_ID);

  // Llega desde la ruta /editions/:id
  readonly id = input.required<string>();

  protected readonly summary = this.summaryApi.byId(this.id);
  private readonly recent = this.summaryApi.latest(signal(NEIGHBOR_WINDOW));
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly items = computed(() =>
    this.summary.hasValue() ? parseNewsItems(this.summary.value().content) : [],
  );

  protected readonly notFound = computed(() => {
    const error = this.summary.error();
    return error instanceof HttpErrorResponse && error.status === NOT_FOUND;
  });

  // La lista viene de la más nueva a la más vieja.
  private readonly position = computed(() =>
    this.recent.hasValue()
      ? this.recent.value().findIndex((s) => s.id === this.id())
      : -1,
  );

  protected readonly newer = computed(() => {
    const index = this.position();
    return index > 0 ? this.recent.value()[index - 1] : undefined;
  });

  protected readonly older = computed(() => {
    const index = this.position();
    return index >= 0 ? this.recent.value()[index + 1] : undefined;
  });

  constructor() {
    // Título de la pestaña con la fecha de la edición.
    effect(() => {
      if (this.summary.hasValue()) {
        const date = formatDate(
          this.summary.value().createdAt,
          "EEEE d 'de' MMMM",
          this.locale,
        );
        this.title.setTitle(`${date} · AguiNews`);
      }
    });

    // Al abrir una edición, el foco va al título para que el lector de pantalla la anuncie.
    afterRenderEffect(() => this.heading()?.nativeElement.focus());
  }
}
