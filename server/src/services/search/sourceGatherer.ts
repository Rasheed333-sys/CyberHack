import { config } from '../../config';
import { search } from './searchService';
import { fetchUrlSafely } from '../browser/sourceFetcher';
import { extractContent } from '../browser/contentExtractor';
import type { NormalizedSource } from './types';

export interface GatherResult {
  sources: NormalizedSource[];
  searched: boolean;
}

const MIN_USEFUL_EXTRACTED_LENGTH = 200;

/**
 * Searches the web, then attempts to fetch + extract full text for the top
 * few results (config.search.sourcesToFetch). Any individual source that
 * fails to fetch or extract falls back to its search snippet rather than
 * being dropped — one bad page should never sink the whole answer.
 */
export async function gatherSources(query: string): Promise<GatherResult> {
  let results;
  try {
    results = await search(query, config.search.maxResults);
  } catch {
    // Search provider unavailable/erroring — caller falls back to a plain
    // AI answer with no sources, per the required graceful-fallback behavior.
    return { sources: [], searched: false };
  }

  if (results.length === 0) {
    return { sources: [], searched: false };
  }

  const toFetch = results.slice(0, config.search.sourcesToFetch);

  const fetchOutcomes = await Promise.allSettled(
    toFetch.map(async (r) => {
      const page = await fetchUrlSafely(r.url);
      return extractContent(page.html, r.url, config.search.perSourceContextChars).text;
    }),
  );

  const sources: NormalizedSource[] = results.map((r, i) => {
    const fetchIndex = toFetch.indexOf(r);
    const outcome = fetchIndex >= 0 ? fetchOutcomes[fetchIndex] : undefined;
    const extractedText = outcome?.status === 'fulfilled' ? outcome.value : null;

    const content =
      extractedText && extractedText.length >= MIN_USEFUL_EXTRACTED_LENGTH
        ? extractedText.slice(0, config.search.perSourceContextChars)
        : r.snippet;

    return {
      id: `source_${i + 1}`,
      title: r.title,
      url: r.url,
      domain: r.domain,
      snippet: r.snippet,
      publishedAt: r.publishedAt,
      content,
    };
  });

  return { sources, searched: true };
}