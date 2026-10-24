// Noticia completa para el modo lectura (GET /api/articles/:id).
export interface Article {
  id: string;
  summaryId: string;
  position: number;
  title: string;
  url: string;
  sourceName: string;
  topic: string;
  headline: string;
  lead: string;
  reading: string; // párrafos separados por una línea en blanco
  keyPoints: string[];
  readingMinutes: number;
  createdAt: string;
}

// La lectura llega como texto: se parte en párrafos para pintarlos por separado.
export function toParagraphs(reading: string): string[] {
  return reading
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
