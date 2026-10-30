import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ReadingState } from '../../../core/reading/reading-state';
import { articleItem, edition } from '../data/testing';
import { EditionPage } from './edition-page';

describe('EditionPage', () => {
  const url = `${environment.apiUrl}/summaries`;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    flushVideos();
    httpTesting.verify();
  });

  // La página también pide los videos del canal: se responden vacíos para que quede estable.
  function flushVideos() {
    httpTesting
      .match((r) => r.url.startsWith(`${environment.apiUrl}/videos`))
      .forEach((r) => r.flush([]));
  }

  // Espera a que la página quede estable respondiendo las peticiones de videos que vayan apareciendo.
  async function settle(fixture: { whenStable(): Promise<unknown> }) {
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve));
      TestBed.tick();
      flushVideos();
    }
    await fixture.whenStable();
  }

  function render() {
    const fixture = TestBed.createComponent(EditionPage);
    fixture.detectChanges();
    TestBed.tick();
    return fixture;
  }

  const today = edition(
    'e1',
    [1, 2, 3].map((p) => articleItem(`a${p}`, p)),
  );

  it('destaca la primera noticia sin leer y lista las demás', async () => {
    TestBed.inject(ReadingState).markRead('a1');
    const fixture = render();
    httpTesting.expectOne(`${url}?count=10`).flush([today]);
    await settle(fixture);

    const element: HTMLElement = fixture.nativeElement;
    const cards = element.querySelectorAll('app-article-card');
    expect(cards.length).toBe(3);
    expect(cards[0].textContent).toContain('Noticia 2');
    expect(cards[0].textContent).toContain('Seguir leyendo');
    expect(element.textContent).toContain('Llevas 1 de 3 noticias leídas');
  });

  it('muestra las ediciones antiguas con enlaces a la fuente', async () => {
    const fixture = render();
    httpTesting.expectOne(`${url}?count=10`).flush([edition('old')]);
    await settle(fixture);

    const links = fixture.nativeElement.querySelectorAll('a[target=_blank]');
    expect(links.length).toBe(2);
    expect(links[1].getAttribute('href')).toBe('https://b.test/2');
  });

  it('avisa cómo resolverlo si la API no responde', async () => {
    const fixture = render();
    httpTesting
      .expectOne(`${url}?count=10`)
      .flush(null, { status: 0, statusText: 'Unknown Error' });
    await settle(fixture);

    expect(fixture.nativeElement.textContent).toContain(
      'No se pudo conectar con la API de AguiNews',
    );
  });
});
