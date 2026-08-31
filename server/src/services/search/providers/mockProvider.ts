import type { SearchProvider, NormalizedSearchResult } from '../types';

const MOCK_DOMAINS = [
  { domain: 'ietf-research.org', title: 'a technical overview' },
  { domain: 'privacytools.dev', title: 'explained' },
  { domain: 'arxiv-mirror.net', title: 'recent findings' },
  { domain: 'techjournal.io', title: 'a critical look' },
  { domain: 'securitydigest.com', title: 'in depth' },
];

export function createMockSearchProvider(): SearchProvider {
  return {
    name: 'mock',

    async search(query: string, maxResults: number): Promise<NormalizedSearchResult[]> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const trimmed = query.trim();
      if (!trimmed) return [];

      return MOCK_DOMAINS.slice(0, maxResults).map((d) => ({
        title: `${trimmed[0].toUpperCase()}${trimmed.slice(1)} — ${d.title}`,
        url: `https://${d.domain}/articles/${encodeURIComponent(trimmed.toLowerCase().replace(/\s+/g, '-'))}`,
        domain: d.domain,
        snippet:
          `[MOCK RESULT] This is placeholder search data (USE_MOCK_SEARCH=true) — no real search provider ` +
          `was called for "${trimmed}".`,
      }));
    },
  };
}