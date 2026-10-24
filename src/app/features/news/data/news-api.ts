import { httpResource } from '@angular/common/http';
import { Service, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Article } from './article';
import { Summary } from './summary';

// Acceso de solo lectura a la API AguiNews: ediciones y noticias.
// Los métodos deben llamarse en un contexto de inyección (al crear un componente).
@Service()
export class NewsApi {
  private readonly summariesUrl = `${environment.apiUrl}/summaries`;
  private readonly articlesUrl = `${environment.apiUrl}/articles`;

  // Las últimas ediciones; se vuelve a pedir cuando cambia `count`.
  latestEditions(count: Signal<number>) {
    return httpResource<Summary[]>(
      () => ({ url: this.summariesUrl, params: { count: count() } }),
      { defaultValue: [] },
    );
  }

  // Una edición por su id. Sin id, el recurso queda en espera (no llama a la API).
  edition(id: Signal<string | undefined>) {
    return httpResource<Summary>(() => {
      const value = id();
      return value ? `${this.summariesUrl}/${value}` : undefined;
    });
  }

  // Una noticia completa por su id.
  article(id: Signal<string>) {
    return httpResource<Article>(() => `${this.articlesUrl}/${id()}`);
  }
}
