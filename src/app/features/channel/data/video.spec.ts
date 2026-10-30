import { normalizeUrl } from './video';

describe('normalizeUrl', () => {
  it('ignora el esquema, "www.", la barra final y los parámetros', () => {
    expect(normalizeUrl('https://www.Example.com/News/123/?utm=x')).toBe(
      'example.com/news/123',
    );
    expect(normalizeUrl('http://example.com/news/123')).toBe(
      'example.com/news/123',
    );
  });

  it('devuelve el texto en minúsculas si no es una URL', () => {
    expect(normalizeUrl(' Sin Enlace ')).toBe('sin enlace');
  });
});
