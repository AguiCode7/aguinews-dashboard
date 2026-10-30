import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import {
  createProgressFile,
  describeImport,
  IMPORT_ERRORS,
  ImportResult,
  MAX_IMPORT_BYTES,
  mergeReadIds,
  mergeSaved,
  parseProgress,
  pickSaved,
  ProgressFile,
  sanitizeReadIds,
  sanitizeSaved,
  SavedArticle,
} from './reading-progress';

export type { SavedArticle } from './reading-progress';

// Claves en localStorage (todo queda en el navegador de quien lee).
export const READING_KEYS = {
  read: 'aguinews.read',
  saved: 'aguinews.saved',
  textSize: 'aguinews.textSize',
} as const;
// Tamaños del texto de lectura, en px.
export const TEXT_SIZES = [16, 18, 20, 22] as const;
const DEFAULT_TEXT_SIZE_INDEX = 1;

// Estado de lectura: noticias leídas, guardadas y tamaño del texto.
// Varias pestañas comparten el mismo almacenamiento: cada escritura fusiona con
// lo último guardado y el evento `storage` trae los cambios de las demás.
@Service()
export class ReadingState {
  private readonly readIds = signal<string[]>(loadReadIds() ?? []);
  private readonly savedItems = signal<SavedArticle[]>(loadSaved() ?? []);
  private readonly textSizeIndex = signal<number>(loadTextSizeIndex());
  // El permiso de almacenamiento persistente se pide una sola vez por sesión.
  private persistenceRequested = false;

  readonly saved = this.savedItems.asReadonly();
  readonly textSize = computed(() => TEXT_SIZES[this.textSizeIndex()]);
  readonly canShrink = computed(() => this.textSizeIndex() > 0);
  readonly canGrow = computed(
    () => this.textSizeIndex() < TEXT_SIZES.length - 1,
  );

  private readonly readSet = computed(() => new Set(this.readIds()));
  private readonly savedSet = computed(
    () => new Set(this.savedItems().map((item) => item.id)),
  );

  constructor() {
    if (typeof window === 'undefined') return;
    // `storage` solo llega a las OTRAS pestañas del mismo sitio, nunca a la que escribe.
    const onStorage = (event: StorageEvent) => this.syncFromStorage(event.key);
    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() =>
      window.removeEventListener('storage', onStorage),
    );
  }

  isRead(id: string): boolean {
    return this.readSet().has(id);
  }

  isSaved(id: string): boolean {
    return this.savedSet().has(id);
  }

  markRead(id: string): void {
    if (this.isRead(id)) return;
    this.requestPersistence();
    // Unión de lo local y lo guardado por otras pestañas; la nueva va al final
    // para que sea la última en perderse al recortar.
    const merged = mergeReadIds(
      mergeReadIds(this.readIds(), loadReadIds() ?? []),
      [id],
    );
    this.readIds.set(merged);
    save(READING_KEYS.read, merged);
  }

  toggleSaved(article: SavedArticle): void {
    // Se parte de la versión más reciente del almacenamiento y se aplica solo este cambio.
    const latest = loadSaved() ?? this.savedItems();
    const others = latest.filter((item) => item.id !== article.id);
    const removing = this.isSaved(article.id);
    if (!removing) this.requestPersistence();
    const next = removing ? others : [pickSaved(article), ...others];
    this.savedItems.set(next);
    save(READING_KEYS.saved, next);
  }

  changeTextSize(step: 1 | -1): void {
    this.textSizeIndex.update((index) =>
      Math.min(TEXT_SIZES.length - 1, Math.max(0, index + step)),
    );
    save(READING_KEYS.textSize, this.textSizeIndex());
  }

  // Copia del progreso para descargar como archivo.
  exportProgress(): ProgressFile {
    return createProgressFile(
      this.readIds(),
      this.savedItems(),
      this.textSize(),
    );
  }

  // Lee, valida y fusiona un archivo exportado. Nunca lanza: devuelve el mensaje a mostrar.
  async importProgress(file: Blob): Promise<ImportResult> {
    if (file.size > MAX_IMPORT_BYTES) {
      return { ok: false, message: IMPORT_ERRORS.tooLarge };
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      return { ok: false, message: IMPORT_ERRORS.unreadable };
    }
    return this.importText(text);
  }

  importText(text: string): ImportResult {
    const parsed = parseProgress(text, TEXT_SIZES);
    if (!parsed.ok) return { ok: false, message: parsed.error };
    const imported = parsed.progress;

    // Lo actual (de esta y otras pestañas) va después: ante el máximo, se conserva primero.
    const currentRead = mergeReadIds(this.readIds(), loadReadIds() ?? []);
    const known = new Set(currentRead);
    const read = mergeReadIds(imported.read, currentRead);
    const addedRead = read.filter((id) => !known.has(id)).length;

    const currentSaved = loadSaved() ?? this.savedItems();
    const saved = mergeSaved(currentSaved, imported.saved);
    const addedSaved = saved.length - currentSaved.length;

    if (addedRead + addedSaved > 0) this.requestPersistence();
    this.readIds.set(read);
    this.savedItems.set(saved);
    save(READING_KEYS.read, read);
    save(READING_KEYS.saved, saved);

    const sizeIndex = TEXT_SIZES.findIndex(
      (size) => size === imported.textSize,
    );
    if (sizeIndex >= 0) {
      this.textSizeIndex.set(sizeIndex);
      save(READING_KEYS.textSize, sizeIndex);
    }

    return { ok: true, message: describeImport(addedRead, addedSaved) };
  }

  // `key` nulo significa que la otra pestaña vació todo el almacenamiento.
  private syncFromStorage(key: string | null): void {
    if (key === null || key === READING_KEYS.read) {
      this.readIds.set(loadReadIds() ?? []);
    }
    if (key === null || key === READING_KEYS.saved) {
      this.savedItems.set(loadSaved() ?? []);
    }
    if (key === null || key === READING_KEYS.textSize) {
      this.textSizeIndex.set(loadTextSizeIndex());
    }
  }

  // Pide al navegador que no borre estos datos cuando falte espacio. No se espera
  // la respuesta: si lo niega o no existe la API, la app sigue igual.
  private requestPersistence(): void {
    if (this.persistenceRequested) return;
    this.persistenceRequested = true;
    try {
      void navigator.storage?.persist?.().catch(() => undefined);
    } catch {
      // Navegadores sin StorageManager: no hay nada que pedir.
    }
  }
}

// undefined = no hay nada guardado o no se puede leer; así quien llama decide el respaldo.
function loadReadIds(): string[] | undefined {
  const value = load(READING_KEYS.read);
  return value === undefined ? undefined : sanitizeReadIds(value);
}

function loadSaved(): SavedArticle[] | undefined {
  const value = load(READING_KEYS.saved);
  return value === undefined ? undefined : sanitizeSaved(value);
}

function loadTextSizeIndex(): number {
  const value = load(READING_KEYS.textSize);
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < TEXT_SIZES.length
    ? value
    : DEFAULT_TEXT_SIZE_INDEX;
}

// localStorage puede no existir o estar bloqueado (modo privado): nunca rompe la app.
function load(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : (JSON.parse(raw) as unknown);
  } catch {
    return undefined;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento: el estado vive solo mientras la pestaña esté abierta.
  }
}
