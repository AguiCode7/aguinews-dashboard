import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Summary } from '../data/summary';
import { EditionCard } from './edition-card';

const SUMMARY: Summary = {
  id: 'abc',
  content:
    '🤖 Uno https://a.test\n🚀 Dos https://b.test\n' +
    '🐘 Tres https://c.test\n🔐 Cuatro https://d.test',
  source: 'Hacker News',
  newsCount: 4,
  createdAt: '2026-10-19T12:00:00Z',
};

describe('EditionCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  async function render(featured: boolean) {
    const fixture = TestBed.createComponent(EditionCard);
    fixture.componentRef.setInput('summary', SUMMARY);
    fixture.componentRef.setInput('featured', featured);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('en portada muestra todos los titulares y enlaza a la edición', async () => {
    const element = await render(true);

    expect(element.querySelectorAll('li').length).toBe(4);
    expect(element.querySelector('a')?.getAttribute('href')).toBe(
      '/editions/abc',
    );
    expect(element.textContent).toContain('Leer la edición');
  });

  it('en versión compacta muestra tres titulares y cuántos faltan', async () => {
    const element = await render(false);

    expect(element.querySelectorAll('li').length).toBe(3);
    expect(element.textContent).toContain('+1');
  });
});
