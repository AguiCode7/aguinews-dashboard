import { computed, Service, signal } from '@angular/core';
import { ArticleItem } from '../../features/news/data/summary';

// Datos mínimos de una noticia guardada, para listarla sin volver a pedirla.
export type SavedArticle = Pick<
  ArticleItem,
  'id' | 'title' | 'sourceName' | 'topic' | 'readingMinutes'
>;

// Claves en localStorage (todo queda en el navegador de quien lee).
const READ_KEY = 'aguinews.read';
const SAVED_KEY = 'aguinews.saved';
const TEXT_SIZE_KEY = 'aguinews.textSize';
// Se recuerdan solo las últimas noticias leídas para no crecer sin límite.
const MAX_READ = 500;
// Tamaños del texto de lectura, en px.
export const TEXT_SIZES = [16, 18, 20, 22] as const;
const DEFAULT_TEXT_SIZE_INDEX = 1;

// Estado de lectura: noticias leídas, guardadas y tamaño del texto.
@Service()
export class ReadingState {
  private readonly readIds = signal<string[]>(load(READ_KEY, []));
  private readonly savedItems = signal<SavedArticle[]>(load(SAVED_KEY, []));
  private readonly textSizeIndex = signal<number>(
    load(TEXT_SIZE_KEY, DEFAULT_TEXT_SIZE_INDEX),
  );

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

  isRead(id: string): boolean {
    return this.readSet().has(id);
  }

  isSaved(id: string): boolean {
    return this.savedSet().has(id);
  }

  markRead(id: string): void {
    if (this.isRead(id)) return;
    this.readIds.update((ids) => [...ids, id].slice(-MAX_READ));
    save(READ_KEY, this.readIds());
  }

  toggleSaved(article: SavedArticle): void {
    this.savedItems.update((items) =>
      this.isSaved(article.id)
        ? items.filter((item) => item.id !== article.id)
        : [pick(article), ...items],
    );
    save(SAVED_KEY, this.savedItems());
  }

  changeTextSize(step: 1 | -1): void {
    this.textSizeIndex.update((index) =>
      Math.min(TEXT_SIZES.length - 1, Math.max(0, index + step)),
    );
    save(TEXT_SIZE_KEY, this.textSizeIndex());
  }
}

// Solo se guardan los campos necesarios, aunque llegue una noticia completa.
function pick(article: SavedArticle): SavedArticle {
  const { id, title, sourceName, topic, readingMinutes } = article;
  return { id, title, sourceName, topic, readingMinutes };
}

// localStorage puede no existir o estar bloqueado (modo privado): nunca rompe la app.
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento: el estado vive solo mientras la pestaña esté abierta.
  }
}
