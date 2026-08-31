export interface NormalizedSearchResult {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedAt?: string;
}

/** A search result enriched with fetched/extracted page content for AI context. Never sent to the client — see toPublicSource(). */
export interface NormalizedSource extends NormalizedSearchResult {
  id: string; // stable id, e.g. "source_1" — matches the [1], [2] the AI is told to cite
  content: string; // extracted article text, or the snippet if fetching failed
}

export interface PublicSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedAt?: string;
}

export function toPublicSource(source: NormalizedSource): PublicSource {
  const { id, title, url, domain, snippet, publishedAt } = source;
  return { id, title, url, domain, snippet, publishedAt };
}

/** Provider-independent search interface — the frontend never knows which provider is active. */
export interface SearchProvider {
  name: string;
  search(query: string, maxResults: number): Promise<NormalizedSearchResult[]>;
}