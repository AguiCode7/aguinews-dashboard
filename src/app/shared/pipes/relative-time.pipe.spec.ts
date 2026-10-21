import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  const now = Date.parse('2026-10-20T12:00:00Z');
  let pipe: RelativeTimePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: LOCALE_ID, useValue: 'es-419' }],
    });
    pipe = TestBed.runInInjectionContext(() => new RelativeTimePipe());
  });

  it('usa horas, "ayer" y días según la distancia', () => {
    expect(pipe.transform('2026-10-20T10:00:00Z', now)).toBe('hace 2 horas');
    expect(pipe.transform('2026-10-19T12:00:00Z', now)).toBe('ayer');
    expect(pipe.transform('2026-10-17T12:00:00Z', now)).toBe('hace 3 días');
  });
});
