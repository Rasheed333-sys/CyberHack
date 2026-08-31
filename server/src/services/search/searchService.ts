import { config } from '../../config';
import { createTavilyProvider } from './providers/tavilyProvider';
import { createMockSearchProvider } from './providers/mockProvider';
import type { SearchProvider, NormalizedSearchResult } from './types';

let cachedProvider: SearchProvider | null = null;

function getProvider(): SearchProvider {
  if (cachedProvider) return cachedProvider;
  cachedProvider = config.useMockSearch ? createMockSearchProvider() : createTavilyProvider();
  return cachedProvider;
}

function normalizeForDedupe(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/** Drops results pointing at the same URL (ignoring protocol/www/trailing slash/query/fragment). */
function dedupe(results: NormalizedSearchResult[]): NormalizedSearchResult[] {
  const seen = new Set<string>();
  const out: NormalizedSearchResult[] = [];
  for (const r of results) {
    const key = normalizeForDedupe(r.url);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export async function search(query: string, maxResults: number): Promise<NormalizedSearchResult[]> {
  const raw = await getProvider().search(query, maxResults);
  return dedupe(raw);
}

export function currentSearchProviderName(): string {
  return getProvider().name;
}