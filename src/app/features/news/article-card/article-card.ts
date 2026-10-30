import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../shared/ui/icon';
import { ArticleItem } from '../data/summary';

// Tarjeta de una noticia: destacada (grande) o en fila. Lleva al modo lectura.
@Component({
  selector: 'app-article-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './article-card.html',
})
export class ArticleCard {
  readonly article = input.required<ArticleItem>();
  readonly read = input(false, { transform: booleanAttribute });
  readonly featured = input(false, { transform: booleanAttribute });
  // La noticia tiene un Short en el canal (el enlace está en el modo lectura).
  readonly hasShort = input(false, { transform: booleanAttribute });
  // Texto del botón de la tarjeta destacada ("Leer…", "Seguir leyendo").
  readonly cta = input('Leer en AguiNews');

  protected number(position: number): string {
    return position.toString().padStart(2, '0');
  }
}
