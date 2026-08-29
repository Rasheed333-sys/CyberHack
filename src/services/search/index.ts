// Search service abstraction — real impl calls VITE_SEARCH_API_URL.
import { USE_MOCK_SERVICES, ENDPOINTS, mockDelay } from '@/lib/config';
import type { SearchSuggestion } from '@/types';

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

export const searchService = {
  suggest: USE_MOCK_SERVICES ? mockSuggest : realSuggest,
  isMock: USE_MOCK_SERVICES,
};