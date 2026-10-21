import { Pipe, PipeTransform } from '@angular/core';

// Un trozo de texto y si coincide con lo que se busca.
export interface TextPart {
  text: string;
  match: boolean;
}

// Parte un texto para resaltar con <mark> lo que el usuario busca.
// No genera HTML: la plantilla decide cómo pintar cada trozo (sin riesgo de XSS).
@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  transform(text: string, term: string): TextPart[] {
    const needle = term.trim().toLowerCase();
    if (!needle) {
      return [{ text, match: false }];
    }
    const parts: TextPart[] = [];
    const haystack = text.toLowerCase();
    let start = 0;
    let index = haystack.indexOf(needle);
    while (index !== -1) {
      if (index > start) {
        parts.push({ text: text.slice(start, index), match: false });
      }
      parts.push({
        text: text.slice(index, index + needle.length),
        match: true,
      });
      start = index + needle.length;
      index = haystack.indexOf(needle, start);
    }
    if (start < text.length) {
      parts.push({ text: text.slice(start), match: false });
    }
    return parts;
  }
}
