import { config } from '../../../config';
import type { SearchProvider, NormalizedSearchResult } from '../types';

/**
 * Tavily (https://tavily.com) — chosen because it has a genuinely free
 * tier with no credit card required (1,000 API credits/month; a "basic"
 * search costs 1 credit), which fits CyberHack's free-first requirement.
 * See server/.env.example and the project README for the full documented
 * limits, since free-tier terms can change.
 *
 * We deliberately request search_depth: "basic" (1 credit, snippets only)
 * rather than "advanced" (2 credits, includes Tavily's own content
 * extraction) — CyberHack does its own fetching/extraction via
 * sourceFetcher + contentExtractor instead, which keeps credit cost lower
 * and reuses infrastructure we need anyway (with our own SSRF protection).
 */

interface TavilyResultItem {
  title?: string;
  url?: string;
  content?: string;
  published_date?: string;
}

interface TavilyResponse {
  results?: TavilyResultItem[];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function createTavilyProvider(): SearchProvider {
  return {
    name: 'tavily',

    async search(query: string, maxResults: number): Promise<NormalizedSearchResult[]> {
      if (!config.tavily.apiKey) {
        throw new Error('Search provider is not configured on the server (missing TAVILY_API_KEY).');
      }

      const res = await fetch(`${config.tavily.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.tavily.apiKey}`,
        },
        body: JSON.stringify({
          query,
          search_depth: 'basic',
          max_results: maxResults,
          include_answer: false,
          include_raw_content: false,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Search provider request failed (${res.status}): ${text.slice(0, 300)}`);
      }

      const data = (await res.json()) as TavilyResponse;
      const results = data.results ?? [];

      return results
        .filter((r): r is Required<Pick<TavilyResultItem, 'title' | 'url'>> & TavilyResultItem => Boolean(r.url && r.title))
        .map((r) => ({
          title: r.title!,
          url: r.url!,
          domain: extractDomain(r.url!),
          snippet: (r.content ?? '').slice(0, 400),
          publishedAt: r.published_date || undefined,
        }));
    },
  };
}