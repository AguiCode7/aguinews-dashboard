// Contrato con la API: mismos nombres que el JSON de /api/videos.

export type VideoKind = 'Video' | 'Short';

// Video o Short del canal, con su enlace a YouTube y su miniatura.
export interface Video {
  youTubeId: string;
  title: string;
  kind: VideoKind;
  url: string;
  thumbnailUrl: string;
  newsUrl: string | null; // noticia de la que salió el Short (si la hay)
  publishedAt: string; // ISO en UTC
}

// Enlace comparable: sin esquema, sin "www.", sin barra final ni parámetros.
// Es la misma regla que usa la API para agrupar noticias repetidas.
export function normalizeUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace(/^www\./i, '');
    return `${host}${pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
