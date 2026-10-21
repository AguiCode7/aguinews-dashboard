import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Summary } from '../data/summary';
import { EditionList } from './edition-list';

function edition(id: number, content: string): Summary {
  return {
    id: String(id),
    content,
    source: 'Hacker News',
    newsCount: 1,
    createdAt: new Date(Date.UTC(2026, 9, 20 - id)).toISOString(),
  };
}

const SUMMARIES: Summary[] = [
  edition(0, '🤖 IA en el navegador'),
  edition(1, '🐘 PostgreSQL 18'),
  edition(2, '🐳 Docker más liviano'),
];

describe('EditionList', () => {
  const url = `${environment.apiUrl}/summaries`;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  // Crea la página y deja que el recurso dispare la petición HTTP.
  function render() {
    const fixture = TestBed.createComponent(EditionList);
    fixture.detectChanges();
    TestBed.tick();
    return fixture;
  }

  function cards(fixture: ReturnType<typeof render>): NodeListOf<Element> {
    return fixture.nativeElement.querySelectorAll('app-edition-card');
  }

  it('muestra tarjetas de carga mientras llega la respuesta', () => {
    const fixture = render();

    expect(fixture.nativeElement.querySelector('[role=status]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain(
      'Todavía no hay ediciones.',
    );
    httpTesting.expectOne(`${url}?count=10`).flush(SUMMARIES);
  });

  it('pide 10 ediciones: la primera en portada y el resto debajo', async () => {
    const fixture = render();

    httpTesting.expectOne(`${url}?count=10`).flush(SUMMARIES);
    await fixture.whenStable();

    expect(cards(fixture).length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('Ediciones anteriores');
  });

  it('busca en las ediciones anteriores sin volver a llamar a la API', async () => {
    const fixture = render();
    httpTesting.expectOne(`${url}?count=10`).flush(SUMMARIES);
    await fixture.whenStable();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type=search]');
    input.value = 'postgres';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    // La portada se queda; debajo, solo la que coincide, con el término resaltado.
    expect(cards(fixture).length).toBe(2);
    expect(fixture.nativeElement.querySelector('mark')?.textContent).toBe(
      'PostgreS',
    );
  });

  it('"Ver más ediciones" pide 10 más y no borra las que ya se ven', async () => {
    const page = Array.from({ length: 10 }, (_, i) =>
      edition(i, `Noticia ${i}`),
    );
    const fixture = render();
    httpTesting.expectOne(`${url}?count=10`).flush(page);
    await fixture.whenStable();

    const button: HTMLButtonElement = [
      ...fixture.nativeElement.querySelectorAll('button'),
    ].find((b: HTMLButtonElement) => b.textContent?.includes('Ver más'));
    button.click();
    TestBed.tick();

    const request = httpTesting.expectOne(`${url}?count=20`);
    expect(cards(fixture).length).toBe(10);
    request.flush(page);
    await fixture.whenStable();
  });

  it('muestra cómo resolverlo si la API no responde', async () => {
    const fixture = render();
    httpTesting
      .expectOne(`${url}?count=10`)
      .flush(null, { status: 0, statusText: 'Unknown Error' });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      'No se pudo conectar con la API de AguiNews',
    );
  });
});
