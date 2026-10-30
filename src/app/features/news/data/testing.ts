import { Article } from './article';
import { ArticleItem, Summary } from './summary';

// Datos ficticios para las pruebas.
export function articleItem(id: string, position: number): ArticleItem {
  return {
    id,
    position,
    title: `Noticia ${position}`,
    url: `https://example.com/noticia-${position}`,
    sourceName: 'example.com',
    topic: position % 2 ? 'Seguridad' : 'Desarrollo',
    headline: `Titular ${position}`,
    readingMinutes: 3,
  };
}

export function edition(id: string, articles: ArticleItem[] = []): Summary {
  return {
    id,
    content: articles.length
      ? 'Resumen'
      : '🤖 Uno https://a.test/1\n🚀 Dos https://b.test/2',
    source: 'Hacker News',
    newsCount: articles.length || 2,
    createdAt: new Date().toISOString(),
    articles,
  };
}

export function article(id: string, summaryId: string, position = 1): Article {
  return {
    ...articleItem(id, position),
    summaryId,
    lead: 'Por qué importa.',
    reading: 'Primer párrafo.\n\nSegundo párrafo.\n\nTercer párrafo.',
    keyPoints: ['Punto uno', 'Punto dos'],
    createdAt: new Date().toISOString(),
  };
}
