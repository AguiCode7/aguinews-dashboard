import { ArticleItem } from '../../features/news/data/summary';

// Datos mínimos de una noticia guardada, para listarla sin volver a pedirla.
export type SavedArticle = Pick<
  ArticleItem,
  'id' | 'title' | 'sourceName' | 'topic' | 'readingMinutes'
>;

// Se recuerdan solo las últimas noticias leídas para no crecer sin límite.
export const MAX_READ = 500;

// Formato del archivo de progreso. Si cambia la forma del JSON, sube la versión
// y acepta las anteriores en parseProgress para no invalidar copias viejas.
export const PROGRESS_FORMAT_VERSION = 1;
export const PROGRESS_FILE_NAME = 'aguinews-progreso.json';
export const PROGRESS_MIME_TYPE = 'application/json';

// Límites de la importación: un archivo ajeno o manipulado no puede llenar el almacenamiento.
export const MAX_IMPORT_BYTES = 1024 * 1024;
const MAX_IMPORT_READ = MAX_READ * 4;
const MAX_IMPORT_SAVED = 1000;
const MAX_ID_LENGTH = 128;
const MAX_TITLE_LENGTH = 500;
const MAX_LABEL_LENGTH = 200;
const MAX_READING_MINUTES = 600;

// Contenido del archivo exportado.
export interface ProgressFile {
  format: 'aguinews-progress';
  version: number;
  exportedAt: string; // ISO en UTC
  read: string[];
  saved: SavedArticle[];
  textSize: number; // en px, uno de TEXT_SIZES
}

// Progreso ya validado, listo para fusionar con el actual.
export interface ImportedProgress {
  read: string[];
  saved: SavedArticle[];
  textSize?: number;
}

export type ParseResult =
  { ok: true; progress: ImportedProgress } | { ok: false; error: string };

export interface ImportResult {
  ok: boolean;
  message: string;
}

// Mensajes de error que ve quien importa (claros y sin detalles técnicos).
export const IMPORT_ERRORS = {
  tooLarge: 'El archivo es demasiado grande para ser un progreso de AguiNews.',
  unreadable: 'No se pudo leer el archivo. Inténtalo de nuevo.',
  notJson: 'El archivo no es un JSON válido.',
  notProgress: 'El archivo no es un progreso exportado desde AguiNews.',
  newerVersion:
    'El archivo viene de una versión más nueva de AguiNews. Actualiza la página e inténtalo otra vez.',
  invalidData: 'El archivo tiene datos dañados o incompletos.',
} as const;

const PROGRESS_FORMAT = 'aguinews-progress';

export function isValidId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= MAX_ID_LENGTH
  );
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}

export function isSavedArticle(value: unknown): value is SavedArticle {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  const minutes = item['readingMinutes'];
  return (
    isValidId(item['id']) &&
    isText(item['title'], MAX_TITLE_LENGTH) &&
    isText(item['sourceName'], MAX_LABEL_LENGTH) &&
    isText(item['topic'], MAX_LABEL_LENGTH) &&
    typeof minutes === 'number' &&
    Number.isInteger(minutes) &&
    minutes >= 0 &&
    minutes <= MAX_READING_MINUTES
  );
}

// Solo se guardan los campos necesarios, aunque llegue una noticia completa.
export function pickSaved(article: SavedArticle): SavedArticle {
  const { id, title, sourceName, topic, readingMinutes } = article;
  return { id, title, sourceName, topic, readingMinutes };
}

// Lo que venga del almacenamiento puede estar dañado: se descarta lo que no encaja.
export function sanitizeReadIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isValidId).slice(-MAX_READ) : [];
}

export function sanitizeSaved(value: unknown): SavedArticle[] {
  return Array.isArray(value)
    ? value.filter(isSavedArticle).map(pickSaved)
    : [];
}

// Unión sin duplicados que conserva el orden (de más antigua a más reciente).
// Al recortar al máximo se pierden las primeras, así que `newer` va al final.
export function mergeReadIds(
  older: readonly string[],
  newer: readonly string[],
  max = MAX_READ,
): string[] {
  const merged = new Set([...older, ...newer]);
  // Si una id ya estaba, Set la deja en su primera posición; se mueve al final
  // para que lo más reciente sobreviva al recorte.
  for (const id of newer) {
    merged.delete(id);
    merged.add(id);
  }
  return [...merged].slice(-max);
}

// Guardadas: `primary` manda (orden y datos); de `extra` se agregan las que falten.
export function mergeSaved(
  primary: readonly SavedArticle[],
  extra: readonly SavedArticle[],
): SavedArticle[] {
  const ids = new Set(primary.map((item) => item.id));
  return [...primary, ...extra.filter((item) => !ids.has(item.id))];
}

export function createProgressFile(
  read: readonly string[],
  saved: readonly SavedArticle[],
  textSize: number,
  now = new Date(),
): ProgressFile {
  return {
    format: PROGRESS_FORMAT,
    version: PROGRESS_FORMAT_VERSION,
    exportedAt: now.toISOString(),
    read: [...read],
    saved: saved.map(pickSaved),
    textSize,
  };
}

// Valida el texto de un archivo de progreso. `textSizes` son los tamaños permitidos.
export function parseProgress(
  text: string,
  textSizes: readonly number[],
): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: IMPORT_ERRORS.notJson };
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: IMPORT_ERRORS.notProgress };
  }
  const file = data as Record<string, unknown>;
  const version = file['version'];
  if (file['format'] !== PROGRESS_FORMAT || typeof version !== 'number') {
    return { ok: false, error: IMPORT_ERRORS.notProgress };
  }
  if (version > PROGRESS_FORMAT_VERSION) {
    return { ok: false, error: IMPORT_ERRORS.newerVersion };
  }

  const read = file['read'];
  const saved = file['saved'];
  const textSize = file['textSize'];
  const valid =
    Array.isArray(read) &&
    read.length <= MAX_IMPORT_READ &&
    read.every(isValidId) &&
    Array.isArray(saved) &&
    saved.length <= MAX_IMPORT_SAVED &&
    saved.every(isSavedArticle) &&
    // El tamaño del texto es opcional; si viene, debe ser uno de los permitidos.
    (textSize === undefined ||
      (typeof textSize === 'number' && textSizes.includes(textSize)));
  if (!valid) return { ok: false, error: IMPORT_ERRORS.invalidData };

  return {
    ok: true,
    progress: {
      read: read.slice(-MAX_READ),
      saved: saved.map(pickSaved),
      textSize: typeof textSize === 'number' ? textSize : undefined,
    },
  };
}

// Resumen de la importación en español, con singular y plural correctos.
export function describeImport(readCount: number, savedCount: number): string {
  if (readCount + savedCount === 0) {
    return 'Tu progreso ya estaba al día: no había noticias nuevas para importar.';
  }
  const verb = readCount + savedCount === 1 ? 'Se importó' : 'Se importaron';
  const read =
    readCount === 1 ? '1 noticia leída' : `${readCount} noticias leídas`;
  if (savedCount === 0) return `${verb} ${read}.`;
  if (readCount === 0) {
    const onlySaved =
      savedCount === 1
        ? '1 noticia guardada'
        : `${savedCount} noticias guardadas`;
    return `${verb} ${onlySaved}.`;
  }
  const saved = savedCount === 1 ? '1 guardada' : `${savedCount} guardadas`;
  return `${verb} ${read} y ${saved}.`;
}
