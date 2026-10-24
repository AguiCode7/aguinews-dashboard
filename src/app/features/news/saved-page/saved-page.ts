import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReadingState } from '../../../core/reading/reading-state';
import { Icon } from '../../../shared/ui/icon';

// Noticias guardadas para leer después (se guardan en este navegador).
@Component({
  selector: 'app-saved-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './saved-page.html',
})
export class SavedPage {
  protected readonly reading = inject(ReadingState);
}
