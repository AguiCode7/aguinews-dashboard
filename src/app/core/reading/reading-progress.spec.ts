import { describeImport, mergeReadIds, mergeSaved } from './reading-progress';

describe('reading-progress', () => {
  it('une leídas sin duplicados y deja lo más reciente al final', () => {
    expect(mergeReadIds(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(mergeReadIds(['a', 'b', 'c'], ['a'])).toEqual(['b', 'c', 'a']);
    expect(mergeReadIds(['a', 'b', 'c'], ['d'], 2)).toEqual(['c', 'd']);
  });

  it('en guardadas manda la lista principal y suma las que falten', () => {
    const item = (id: string, title = id) => ({
      id,
      title,
      sourceName: 'example.com',
      topic: 'IA',
      readingMinutes: 2,
    });

    const merged = mergeSaved(
      [item('a', 'Nuevo')],
      [item('a', 'Viejo'), item('b')],
    );

    expect(merged.map((a) => a.title)).toEqual(['Nuevo', 'b']);
  });

  it('describe la importación en singular y plural', () => {
    expect(describeImport(0, 0)).toContain('ya estaba al día');
    expect(describeImport(1, 0)).toBe('Se importó 1 noticia leída.');
    expect(describeImport(0, 3)).toBe('Se importaron 3 noticias guardadas.');
    expect(describeImport(5, 2)).toBe(
      'Se importaron 5 noticias leídas y 2 guardadas.',
    );
  });
});
