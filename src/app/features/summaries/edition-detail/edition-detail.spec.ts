import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Summary } from '../data/summary';
import { EditionDetail } from './edition-detail';

function edition(id: string, day: number): Summary {
  return {
    id,
    content: '🤖 Uno https://a.test/1\n🚀 Dos https://b.test/2',
    source: 'Hacker News',
    newsCount: 2,
    createdAt: new Date(Date.UTC(2026, 9, day, 12)).toISOString(),
  };
}

describe('EditionDetail', () => {
  const url = `${environment.apiUrl}/summaries`;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  function render() {
    const fixture = TestBed.createComponent(EditionDetail);
    fixture.componentRef.setInput('id', 'abc');
    fixture.detectChanges();
    TestBed.tick();
    return fixture;
  }

  it('muestra cada noticia como enlace y las ediciones vecinas', async () => {
    const fixture = render();
    httpTesting.expectOne(`${url}/abc`).flush(edition('abc', 19));
    httpTesting
      .expectOne(`${url}?count=50`)
      .flush([edition('new', 20), edition('abc', 19), edition('old', 18)]);
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    const links = element.querySelectorAll('ol a[target=_blank]');
    expect(links.length).toBe(2);
    expect(links[1].getAttribute('href')).toBe('https://b.test/2');
    expect(links[1].getAttribute('rel')).toBe('noopener');

    const nav = element.querySelector('nav[aria-label="Otras ediciones"]');
    expect(nav?.textContent).toContain('Edición anterior');
    expect(nav?.textContent).toContain('Edición siguiente');
  });

  it('avisa si la edición no existe', async () => {
    const fixture = render();
    httpTesting
      .expectOne(`${url}/abc`)
      .flush(null, { status: 404, statusText: 'Not Found' });
    httpTesting.expectOne(`${url}?count=50`).flush([]);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      'Esta edición no existe',
    );
  });
});
