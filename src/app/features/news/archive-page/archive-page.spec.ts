import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { articleItem, edition } from '../data/testing';
import { ArchivePage } from './archive-page';

describe('ArchivePage', () => {
  const url = `${environment.apiUrl}/summaries`;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  async function render(inputs: { q?: string; topic?: string } = {}) {
    const fixture = TestBed.createComponent(ArchivePage);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    TestBed.tick();
    httpTesting
      .expectOne(`${url}?count=50`)
      .flush([
        edition('e1', [articleItem('a1', 1), articleItem('a2', 2)]),
        edition('e2', [articleItem('a3', 3)]),
      ]);
    await fixture.whenStable();
    return fixture;
  }

  it('sin filtros lista las ediciones', async () => {
    const fixture = await render();

    expect(
      fixture.nativeElement.querySelectorAll('a[href^="/editions/"]').length,
    ).toBe(2);
  });

  it('filtra las noticias por tema desde la URL', async () => {
    const fixture = await render({ topic: 'Seguridad' });
    const links = fixture.nativeElement.querySelectorAll(
      'a[href^="/articles/"]',
    );

    // Las posiciones impares son "Seguridad" en los datos de prueba.
    expect(links.length).toBe(2);
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('2 noticias encontradas en Seguridad');
  });

  it('busca en títulos y resalta la coincidencia', async () => {
    const fixture = await render({ q: 'Noticia 3' });

    expect(fixture.nativeElement.querySelector('mark')?.textContent).toBe(
      'Noticia 3',
    );
  });
});
