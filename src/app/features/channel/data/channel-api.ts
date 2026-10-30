import { httpResource } from '@angular/common/http';
import { computed, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { normalizeUrl, Video, VideoKind } from './video';

// Acceso de solo lectura a los videos del canal guardados en la API AguiNews.
// Los métodos deben llamarse en un contexto de inyección (al crear un componente).
@Service()
export class ChannelApi {
  private readonly videosUrl = `${environment.apiUrl}/videos`;

  // Los últimos videos, opcionalmente de un solo tipo (Video o Short).
  latest(count: number, kind?: VideoKind) {
    const params: Record<string, string | number> = kind
      ? { count, kind }
      : { count };
    return httpResource<Video[]>(() => ({ url: this.videosUrl, params }), {
      defaultValue: [],
    });
  }

  // Shorts enlazados con su noticia, indexados por el enlace normalizado de la noticia.
  shortsByNews() {
    const resource = httpResource<Video[]>(
      () => `${this.videosUrl}/with-news`,
      {
        defaultValue: [],
      },
    );
    return computed(() => {
      // Si la API falla, el sitio sigue funcionando: solo no muestra los enlaces.
      const videos = resource.hasValue() ? resource.value() : [];
      return new Map(
        videos
          .filter((v) => v.newsUrl)
          .map((v) => [normalizeUrl(v.newsUrl!), v] as const),
      );
    });
  }
}
