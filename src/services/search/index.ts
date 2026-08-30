// Search service abstraction — real impl calls VITE_SEARCH_API_URL.
import { USE_MOCK_SERVICES, ENDPOINTS, mockDelay } from '@/lib/config';
import type { SearchSuggestion, SearchResult } from '@/types';

const MOCK_SUGGESTIONS: SearchSuggestion[] = [
  { id: 'a1', label: 'Research the latest cybersecurity threats', kind: 'suggestion' },
  { id: 'a2', label: 'Compare three articles on quantum computing', kind: 'suggestion' },
  { id: 'a3', label: 'Explain this documentation', kind: 'action' },
  { id: 'h1', label: 'Best Linux distributions', kind: 'history' },
  { id: 'h2', label: 'SIH project research', kind: 'history' },
];

async function mockSuggest(query: string): Promise<SearchSuggestion[]> {
  await mockDelay(150);
  if (!query.trim()) return MOCK_SUGGESTIONS.slice(0, 4);
  return MOCK_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));
}

async function realSuggest(query: string): Promise<SearchSuggestion[]> {
  const res = await fetch(`${ENDPOINTS.search}/suggest?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Search service error: ${res.status}`);
  return res.json();
}

const MOCK_DOMAINS = [
  { domain: 'ietf-research.org', secure: true },
  { domain: 'privacytools.dev', secure: true },
  { domain: 'arxiv-mirror.net', secure: true },
  { domain: 'techjournal.io', secure: true },
  { domain: 'oldforum-archive.net', secure: false },
  { domain: 'securitydigest.com', secure: true },
];

async function mockSearch(query: string): Promise<SearchResult[]> {
  await mockDelay(650);
  if (!query.trim()) return [];
  return MOCK_DOMAINS.map((d, i) => ({
    id: `res-${i}`,
    title: `${query[0].toUpperCase()}${query.slice(1)} — ${['an overview', 'explained', 'in depth', 'a technical primer', 'recent findings', 'a critical look'][i]}`,
    url: `https://${d.domain}/articles/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
    domain: d.domain,
    description:
      '[MOCK RESULT] This is placeholder search-result data — no live search index is connected yet. ' +
      `Once wired up, this will summarize a real page about "${query}".`,
    secure: d.secure,
    isMockData: true,
  }));
}

async function realSearch(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${ENDPOINTS.search}?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Search service error: ${res.status}`);
  return res.json();
}

export const searchService = {
  suggest: USE_MOCK_SERVICES ? mockSuggest : realSuggest,
  search: USE_MOCK_SERVICES ? mockSearch : realSearch,
  isMock: USE_MOCK_SERVICES,
};