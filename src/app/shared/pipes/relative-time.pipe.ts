import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

// Convierte una fecha ISO en "hace 3 horas", "ayer", etc., en el idioma de la app.
@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  private readonly format = new Intl.RelativeTimeFormat(inject(LOCALE_ID), {
    numeric: 'auto',
  });

  transform(isoDate: string, now: number = Date.now()): string {
    const diff = new Date(isoDate).getTime() - now;
    for (const [unit, ms] of UNITS) {
      if (Math.abs(diff) >= ms) {
        return this.format.format(Math.round(diff / ms), unit);
      }
    }
    return this.format.format(0, 'minute');
  }
}
