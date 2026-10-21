// Una noticia dentro de un resumen: el titular y, si lo trae, su enlace.
export interface NewsItem {
  icon: string | null;
  headline: string;
  url: string | null;
  domain: string | null;
}

const URL_PATTERN = /https?:\/\/\S+/;
const LEADING_EMOJI = /^(\p{Extended_Pictographic}️?)\s*/u;

// El bot escribe una noticia por línea: "🤖 Titular https://enlace".
export function parseNewsItems(content: string): NewsItem[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(toNewsItem);
}

function toNewsItem(line: string): NewsItem {
  const url = line.match(URL_PATTERN)?.[0] ?? null;
  const withoutUrl = url ? line.replace(url, '').trim() : line;
  const icon = withoutUrl.match(LEADING_EMOJI)?.[1] ?? null;
  const headline = icon ? withoutUrl.replace(LEADING_EMOJI, '') : withoutUrl;
  return { icon, headline, url, domain: url ? domainOf(url) : null };
}

function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
