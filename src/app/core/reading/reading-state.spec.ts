import { TestBed } from '@angular/core/testing';
import { articleItem } from '../../features/news/data/testing';
import {
  IMPORT_ERRORS,
  MAX_IMPORT_BYTES,
  MAX_READ,
  PROGRESS_FORMAT_VERSION,
  SavedArticle,
} from './reading-progress';
import { READING_KEYS, ReadingState, TEXT_SIZES } from './reading-state';

describe('ReadingState', () => {
  beforeEach(() => localStorage.clear());

  function create(): ReadingState {
    TestBed.resetTestingModule();
    return TestBed.inject(ReadingState);
  }

  function saved(id: string): SavedArticle {
    const { title, sourceName, topic, readingMinutes } = articleItem(id, 1);
    return { id, title, sourceName, topic, readingMinutes };
  }

  function stored<T>(key: string): T {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as T;
  }

  // Simula lo que hace otra pestaña: escribe y el navegador avisa con `storage`.
  function writeFromOtherTab(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new StorageEvent('storage', { key }));
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

  it('ignora datos dañados en el almacenamiento', () => {
    localStorage.setItem(READING_KEYS.read, '{"no":"lista"}');
    localStorage.setItem(READING_KEYS.saved, '[{"id":1}]');
    localStorage.setItem(READING_KEYS.textSize, '99');
    const state = create();

    expect(state.isRead('no')).toBe(false);
    expect(state.saved()).toEqual([]);
    expect(state.textSize()).toBe(TEXT_SIZES[1]);
  });

  describe('entre pestañas', () => {
    it('recarga lo que otra pestaña cambia', () => {
      const state = create();

      writeFromOtherTab(READING_KEYS.read, ['b1']);
      writeFromOtherTab(READING_KEYS.saved, [saved('s1')]);
      writeFromOtherTab(READING_KEYS.textSize, 3);

      expect(state.isRead('b1')).toBe(true);
      expect(state.isSaved('s1')).toBe(true);
      expect(state.textSize()).toBe(TEXT_SIZES[3]);
    });

    it('vuelve a cero si otra pestaña borra todo', () => {
      const state = create();
      state.markRead('a1');

      localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null }));

      expect(state.isRead('a1')).toBe(false);
    });

    it('al marcar leída une lo de ambas pestañas', () => {
      const state = create();
      state.markRead('a1');
      // Otra pestaña escribió, pero el aviso aún no llegó.
      localStorage.setItem(READING_KEYS.read, JSON.stringify(['a1', 'b1']));

      state.markRead('a2');

      expect(stored<string[]>(READING_KEYS.read)).toEqual(['a1', 'b1', 'a2']);
      expect(state.isRead('b1')).toBe(true);
    });

    it('respeta el máximo de leídas y conserva la más reciente', () => {
      const ids = Array.from({ length: MAX_READ }, (_, i) => `old-${i}`);
      localStorage.setItem(READING_KEYS.read, JSON.stringify(ids));
      const state = create();

      state.markRead('new');

      const result = stored<string[]>(READING_KEYS.read);
      expect(result.length).toBe(MAX_READ);
      expect(result.at(-1)).toBe('new');
      expect(result).not.toContain('old-0');
    });

    it('al guardar parte de la versión más reciente del almacenamiento', () => {
      const state = create();
      state.toggleSaved(saved('s1'));
      // La otra pestaña quitó s1 y guardó s2.
      localStorage.setItem(READING_KEYS.saved, JSON.stringify([saved('s2')]));

      state.toggleSaved(saved('s3'));

      const ids = stored<SavedArticle[]>(READING_KEYS.saved).map((a) => a.id);
      expect(ids).toEqual(['s3', 's2']);
      expect(state.saved().map((a) => a.id)).toEqual(['s3', 's2']);
    });
  });

  describe('almacenamiento persistente', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'storage');
    let persist: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      persist = vi.fn(() => Promise.resolve(true));
      Object.defineProperty(navigator, 'storage', {
        configurable: true,
        value: { persist },
      });
    });

    afterEach(() => {
      if (original) Object.defineProperty(navigator, 'storage', original);
      else Reflect.deleteProperty(navigator, 'storage');
    });

    it('lo pide una sola vez, al leer o guardar por primera vez', () => {
      const state = create();
      expect(persist).not.toHaveBeenCalled();

      state.markRead('a1');
      state.markRead('a2');
      state.toggleSaved(saved('s1'));

      expect(persist).toHaveBeenCalledTimes(1);
    });

    it('no rompe nada si el navegador lo rechaza', () => {
      persist.mockReturnValue(Promise.reject(new Error('denegado')));
      const state = create();

      expect(() => state.markRead('a1')).not.toThrow();
      expect(state.isRead('a1')).toBe(true);
    });
  });

  describe('exportar e importar', () => {
    function file(content: unknown): Blob {
      return new Blob([JSON.stringify(content)], { type: 'application/json' });
    }

    it('exporta leídas, guardadas y tamaño del texto con versión de formato', () => {
      const state = create();
      state.markRead('a1');
      state.toggleSaved(saved('s1'));
      state.changeTextSize(1);

      const progress = state.exportProgress();

      expect(progress.version).toBe(PROGRESS_FORMAT_VERSION);
      expect(progress.read).toEqual(['a1']);
      expect(progress.saved).toEqual([saved('s1')]);
      expect(progress.textSize).toBe(TEXT_SIZES[2]);
      expect(Date.parse(progress.exportedAt)).not.toBeNaN();
    });

    it('lo exportado se vuelve a importar en otro navegador', async () => {
      const source = create();
      source.markRead('a1');
      source.markRead('a2');
      source.toggleSaved(saved('s1'));
      const exported = source.exportProgress();
      localStorage.clear();

      const target = create();
      const result = await target.importProgress(file(exported));

      expect(result).toEqual({
        ok: true,
        message: 'Se importaron 2 noticias leídas y 1 guardada.',
      });
      expect(target.isRead('a2')).toBe(true);
      expect(target.isSaved('s1')).toBe(true);
      expect(target.textSize()).toBe(exported.textSize);
    });

    it('fusiona con lo actual y cuenta solo lo nuevo', async () => {
      const state = create();
      state.markRead('a1');
      state.toggleSaved(saved('s1'));
      const exported = {
        ...state.exportProgress(),
        read: ['a1', 'b1'],
        saved: [saved('s1'), saved('s2')],
      };

      const result = await state.importProgress(file(exported));

      expect(result.message).toBe(
        'Se importaron 1 noticia leída y 1 guardada.',
      );
      expect(stored<string[]>(READING_KEYS.read)).toEqual(['b1', 'a1']);
      expect(state.saved().map((a) => a.id)).toEqual(['s1', 's2']);
    });

    it('rechaza archivos que no son JSON', async () => {
      const state = create();
      state.markRead('a1');

      const result = await state.importProgress(new Blob(['no es json']));

      expect(result).toEqual({ ok: false, message: IMPORT_ERRORS.notJson });
      expect(state.isRead('a1')).toBe(true);
    });

    it('rechaza JSON que no es un progreso de AguiNews', async () => {
      const result = await create().importProgress(file({ read: ['a1'] }));

      expect(result).toEqual({ ok: false, message: IMPORT_ERRORS.notProgress });
    });

    it('rechaza datos con tipos incorrectos sin tocar lo actual', async () => {
      const state = create();
      const exported = state.exportProgress();

      const badRead = await state.importProgress(
        file({ ...exported, read: ['a1', 42] }),
      );
      const badSaved = await state.importProgress(
        file({ ...exported, saved: [{ id: 's1', title: 'Sin más datos' }] }),
      );
      const badSize = await state.importProgress(
        file({ ...exported, textSize: 99 }),
      );

      for (const result of [badRead, badSaved, badSize]) {
        expect(result).toEqual({
          ok: false,
          message: IMPORT_ERRORS.invalidData,
        });
      }
      expect(state.isRead('a1')).toBe(false);
      expect(localStorage.getItem(READING_KEYS.read)).toBeNull();
    });

    it('rechaza versiones futuras del formato', async () => {
      const state = create();
      const exported = state.exportProgress();

      const result = await state.importProgress(
        file({ ...exported, version: PROGRESS_FORMAT_VERSION + 1 }),
      );

      expect(result).toEqual({
        ok: false,
        message: IMPORT_ERRORS.newerVersion,
      });
    });

    it('rechaza archivos demasiado grandes sin leerlos', async () => {
      const big = new Blob(['x'.repeat(MAX_IMPORT_BYTES + 1)]);

      const result = await create().importProgress(big);

      expect(result).toEqual({ ok: false, message: IMPORT_ERRORS.tooLarge });
    });
  });
});
