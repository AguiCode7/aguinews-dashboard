import { TestBed } from '@angular/core/testing';
import { articleItem } from '../../features/news/data/testing';
import { ReadingState, TEXT_SIZES } from './reading-state';

describe('ReadingState', () => {
  beforeEach(() => localStorage.clear());

  function create(): ReadingState {
    TestBed.resetTestingModule();
    return TestBed.inject(ReadingState);
  }

  it('recuerda las noticias leídas entre visitas', () => {
    create().markRead('a1');

    expect(create().isRead('a1')).toBe(true);
  });

  it('guarda y quita noticias con solo los datos necesarios', () => {
    const state = create();
    state.toggleSaved({ ...articleItem('a1', 1) });

    expect(state.isSaved('a1')).toBe(true);
    expect(Object.keys(state.saved()[0]).sort()).toEqual(
      ['id', 'readingMinutes', 'sourceName', 'title', 'topic'].sort(),
    );

    state.toggleSaved(articleItem('a1', 1));
    expect(state.saved()).toEqual([]);
  });

  it('cambia el tamaño del texto sin salirse de los límites', () => {
    const state = create();
    for (let i = 0; i < 10; i++) state.changeTextSize(1);
    expect(state.textSize()).toBe(TEXT_SIZES[TEXT_SIZES.length - 1]);
    expect(state.canGrow()).toBe(false);

    for (let i = 0; i < 10; i++) state.changeTextSize(-1);
    expect(state.textSize()).toBe(TEXT_SIZES[0]);
  });
});
