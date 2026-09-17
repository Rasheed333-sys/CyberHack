import { config } from '../../config';
import { gatherSources } from '../search/sourceGatherer';
import { rankSearchResults } from '../search/sourceRanker';
import { planResearch } from './researchPlanner';
import type { NormalizedSource } from '../search/types';

export interface ResearchGatherResult {
  sources: NormalizedSource[];
  searched: boolean;
  /** The planned queries actually executed — useful for logging, not sent to the client. */
  queries: string[];
}

/**
 * Caps the final, synthesis-bound source set. Deliberately derived from
 * existing config rather than an invented number: up to twice the
 * per-query fetch budget (config.search.sourcesToFetch), never exceeding
 * the existing per-request results ceiling used elsewhere
 * (config.searchRequest.maxResultsCeiling). Keeps a multi-query run's
 * total evidence bounded and proportionate, rather than scaling
 * unboundedly with however many queries the planner produced.
 */
const MAX_RESEARCH_SOURCES = Math.min(config.search.sourcesToFetch * 2, config.searchRequest.maxResultsCeiling);

/**
 * Same URL-normalization concept as searchService.ts's private dedupe
 * (ignore protocol/www/trailing slash/query/fragment) — duplicated here
 * as a small pure function rather than exported from searchService.ts,
 * since that file is intentionally left unmodified and this is only used
 * for a second, cross-query dedupe pass that single-query search doesn't
 * need.
 */
function normalizeUrlForDedupe(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Runs the deterministic planner, then executes each planned query through
 * the existing single-query gatherSources() pipeline (search → rank →
 * safe fetch → extract — all reused as-is, nothing duplicated), in
 * parallel and independently: one failing/empty query never fails the run.
 *
 * gatherSources() assigns "source_N" ids per call, which only makes sense
 * for a single query's own results. Here it runs multiple times, so those
 * per-call ids are discarded and reassigned exactly once — after merging,
 * deduplicating across queries, and re-ranking the combined pool — so the
 * final [1]/[2]/... citation numbers match one coherent, ranked source
 * list instead of colliding per-query numbering.
 */
export async function gatherResearchSources(query: string): Promise<ResearchGatherResult> {
  const queries = planResearch(query);

  const outcomes = await Promise.allSettled(queries.map((q) => gatherSources(q)));

  const pool: NormalizedSource[] = [];
  for (const outcome of outcomes) {
    if (outcome.status === 'fulfilled' && outcome.value.searched) {
      pool.push(...outcome.value.sources);
    }
    // A rejected or empty-result query is simply skipped — per-query
    // failures must not fail the whole research run.
  }

  if (pool.length === 0) {
    return { sources: [], searched: false, queries };
  }

  const seen = new Set<string>();
  const deduped: NormalizedSource[] = [];
  for (const source of pool) {
    const key = normalizeUrlForDedupe(source.url);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(source);
  }

  // Reuse the existing ranker as-is. rankSearchResults only reads url and
  // reorders — it never mutates elements or fabricates new ones — so the
  // objects coming back are still the same NormalizedSource references;
  // the cast just restores the narrower type the ranker's general
  // NormalizedSearchResult[] signature erased.
  const ranked = rankSearchResults(deduped) as NormalizedSource[];

  const finalSources: NormalizedSource[] = ranked.slice(0, MAX_RESEARCH_SOURCES).map((source, index) => ({
    ...source,
    id: `source_${index + 1}`,
  }));

  return { sources: finalSources, searched: true, queries };
}