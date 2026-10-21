import { DatePipe } from '@angular/common';
import { booleanAttribute, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HighlightPipe } from '../../../shared/pipes/highlight.pipe';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { parseNewsItems } from '../data/news-item';
import { Summary } from '../data/summary';

// En la versión compacta solo se ven los primeros titulares.
const COMPACT_HEADLINES = 3;
// Una edición es "nueva" durante sus primeras horas.
const NEW_EDITION_MS = 6 * 60 * 60 * 1000;

// Tarjeta de una edición: grande (portada) o compacta (ediciones anteriores).
@Component({
  selector: 'app-edition-card',
  imports: [DatePipe, RouterLink, HighlightPipe, RelativeTimePipe],
  templateUrl: './edition-card.html',
})
export class EditionCard {
  readonly summary = input.required<Summary>();
  readonly featured = input(false, { transform: booleanAttribute });
  // Texto buscado, para resaltarlo en los titulares.
  readonly highlight = input('');

  protected readonly items = computed(() =>
    parseNewsItems(this.summary().content),
  );

  protected readonly visibleItems = computed(() =>
    this.featured() ? this.items() : this.items().slice(0, COMPACT_HEADLINES),
  );

  protected readonly hiddenCount = computed(
    () => this.items().length - this.visibleItems().length,
  );

  protected readonly isToday = computed(
    () =>
      new Date(this.summary().createdAt).toDateString() ===
      new Date().toDateString(),
  );

  protected readonly isNew = computed(
    () =>
      Date.now() - new Date(this.summary().createdAt).getTime() <
      NEW_EDITION_MS,
  );
}
