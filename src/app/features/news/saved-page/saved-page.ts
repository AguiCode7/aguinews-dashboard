import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ImportResult,
  PROGRESS_FILE_NAME,
  PROGRESS_MIME_TYPE,
} from '../../../core/reading/reading-progress';
import { ReadingState } from '../../../core/reading/reading-state';
import { Icon } from '../../../shared/ui/icon';

// Sangría del JSON exportado: legible si alguien lo abre.
const JSON_INDENT = 2;

// Noticias guardadas para leer después (se guardan en este navegador),
// y la copia de seguridad del progreso para no perderlo.
@Component({
  selector: 'app-saved-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './saved-page.html',
})
export class SavedPage {
  protected readonly reading = inject(ReadingState);
  private readonly document = inject(DOCUMENT);

  protected readonly importResult = signal<ImportResult | null>(null);
  protected readonly importing = signal(false);

  protected exportProgress(): void {
    const json = JSON.stringify(
      this.reading.exportProgress(),
      null,
      JSON_INDENT,
    );
    const url = URL.createObjectURL(
      new Blob([json], { type: PROGRESS_MIME_TYPE }),
    );
    const link = this.document.createElement('a');
    link.href = url;
    link.download = PROGRESS_FILE_NAME;
    link.click();
    // Se libera en el siguiente ciclo: algunos navegadores leen la URL tras el clic.
    setTimeout(() => URL.revokeObjectURL(url));
  }

  protected async importProgress(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    // Se limpia para que elegir el mismo archivo otra vez vuelva a importarlo.
    input.value = '';
    if (!file) return;
    this.importing.set(true);
    this.importResult.set(await this.reading.importProgress(file));
    this.importing.set(false);
  }
}
