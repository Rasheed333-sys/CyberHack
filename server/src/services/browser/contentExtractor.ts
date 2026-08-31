/**
 * Deliberately simple content extraction: strip script/style/nav/header/
 * footer/comments, strip remaining tags, decode common entities, collapse
 * whitespace. This will not perfectly parse every page layout — it doesn't
 * try to. It's good enough to hand the AI usable article text instead of
 * raw HTML, and it fails safe (returns whatever text it can, never throws
 * on odd markup).
 */

export interface ExtractedContent {
  title: string;
  url: string;
  text: string;
  wordCount: number;
}

const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&apos;': "'",
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
};

function decodeEntities(input: string): string {
  let out = input;
  for (const [entity, char] of Object.entries(ENTITY_MAP)) {
    out = out.split(entity).join(char);
  }
  // Numeric entities, e.g. &#8217;
  out = out.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  return out;
}

export function extractContent(html: string, url: string, maxChars = 6000): ExtractedContent {
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = titleMatch ? decodeEntities(titleMatch[1]).replace(/\s+/g, ' ').trim().slice(0, 200) : url;

  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  const text = decodeEntities(stripped).replace(/\s+/g, ' ').trim().slice(0, maxChars);
  const wordCount = text.length ? text.split(/\s+/).filter(Boolean).length : 0;

  return { title, url, text, wordCount };
}