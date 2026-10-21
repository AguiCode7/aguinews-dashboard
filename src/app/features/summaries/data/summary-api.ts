import { httpResource } from '@angular/common/http';
import { Service, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Summary } from './summary';

// Acceso de solo lectura a los resúmenes de la API AguiNews.
// Los métodos deben llamarse en un contexto de inyección (al crear un componente).
@Service()
export class SummaryApi {
  private readonly baseUrl = `${environment.apiUrl}/summaries`;

  // Los últimos resúmenes; se vuelve a pedir cuando cambia `count`.
  latest(count: Signal<number>) {
    return httpResource<Summary[]>(
      () => ({ url: this.baseUrl, params: { count: count() } }),
      { defaultValue: [] },
    );
  }

  // Un resumen por su id; se vuelve a pedir cuando cambia `id`.
  byId(id: Signal<string>) {
    return httpResource<Summary>(() => `${this.baseUrl}/${id()}`);
  }
}
