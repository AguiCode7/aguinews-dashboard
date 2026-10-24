import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LayoutState } from '../../../core/layout/layout-state';
import { ReadingState } from '../../../core/reading/reading-state';
import { article, articleItem, edition } from '../data/testing';
import { ReaderPage } from './reader-page';

describe('ReaderPage', () => {
  const api = environment.apiUrl;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  async function render() {
    const fixture = TestBed.createComponent(ReaderPage);
    fixture.componentRef.setInput('id', 'a1');
    fixture.detectChanges();
    TestBed.tick();
    httpTesting.expectOne(`${api}/articles/a1`).flush(article('a1', 'e1'));
    // Con la noticia ya cargada, se pide su edición (para el índice y la navegación).
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
    httpTesting
      .expectOne(`${api}/summaries/e1`)
      .flush(edition('e1', [articleItem('a1', 1), articleItem('a2', 2)]));
    await fixture.whenStable();
    return fixture;
  }

  it('muestra la lectura por párrafos, los puntos clave y el enlace original', async () => {
    const fixture = await render();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toContain('Noticia 1');
    expect(element.textContent).toContain('Segundo párrafo.');
    expect(element.textContent).toContain('Punto dos');
    const original = element.querySelector('a[target=_blank]');
    expect(original?.getAttribute('href')).toBe('https://example.com/noticia');
    expect(original?.getAttribute('rel')).toBe('noopener');
  });

  it('marca la noticia como leída y enlaza la siguiente de la edición', async () => {
    const fixture = await render();

    expect(TestBed.inject(ReadingState).isRead('a1')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Noticia 1 de 2');
    expect(
      fixture.nativeElement.querySelector('a[aria-label="Noticia siguiente"]'),
    ).not.toBeNull();
  });

  it('oculta la barra de secciones del móvil solo mientras se lee', async () => {
    const fixture = await render();
    const layout = TestBed.inject(LayoutState);

    expect(layout.immersive()).toBe(true);
    fixture.destroy();
    expect(layout.immersive()).toBe(false);
  });
});
