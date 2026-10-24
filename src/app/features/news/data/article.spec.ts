import { toParagraphs } from './article';

describe('toParagraphs', () => {
  it('separa la lectura por líneas en blanco y quita espacios', () => {
    expect(toParagraphs('  Uno.\n\n\nDos.  \n \nTres.')).toEqual([
      'Uno.',
      'Dos.',
      'Tres.',
    ]);
  });
});
