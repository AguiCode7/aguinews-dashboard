// Contrato con la API: mismos nombres que el JSON de /api/summaries.

// Noticia en versión ligera, tal como viene dentro de una edición.
export interface ArticleItem {
  id: string;
  position: number;
  title: string;
  url: string; // enlace a la fuente original (enlaza la noticia con su Short)
  sourceName: string;
  topic: string;
  headline: string;
  readingMinutes: number;
}

// Edición del día. Las ediciones anteriores al video 4 no traen `articles`.
export interface Summary {
  id: string;
  content: string;
  source: string;
  newsCount: number;
  createdAt: string; // ISO en UTC
  articles: ArticleItem[];
}
