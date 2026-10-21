import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {
  const pipe = new HighlightPipe();

  it('marca cada coincidencia sin importar mayúsculas', () => {
    expect(pipe.transform('PostgreSQL y postgres', 'postgres')).toEqual([
      { text: 'PostgreS', match: true },
      { text: 'QL y ', match: false },
      { text: 'postgres', match: true },
    ]);
  });

  it('devuelve el texto completo si no hay búsqueda', () => {
    expect(pipe.transform('Angular 22', '  ')).toEqual([
      { text: 'Angular 22', match: false },
    ]);
  });
});
