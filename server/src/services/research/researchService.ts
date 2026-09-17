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
 * Research may combine results from several targeted searches.
 *
 * Keep the final source set bounded so one research request does not create
 * an unnecessarily large AI context or excessive page-fetch work.
 */
const MAX_RESEARCH_SOURCES = Math.min(
  config.search.sourcesToFetch * 2,
  config.searchRequest.maxResultsCeiling,
);

/**
 * Research intentionally uses fewer search variations than the planner's
 * absolute maximum when the configured source-fetch budget is small.
 *
 * With the current defaults:
 *   sourcesToFetch = 4
 *   maxResultsCeiling = 10
 *   maxResearchSources = 8
 *   maxResearchQueries = 4
 */
const MAX_RESEARCH_QUERIES = Math.min(
  4,
  Math.max(2, config.search.sourcesToFetch),
);

function normalizeUrlForDedupe(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export async function gatherResearchSources(query: string): Promise<ResearchGatherResult> {
  const plannedQueries = planResearch(query);
  const queries = plannedQueries.slice(0, MAX_RESEARCH_QUERIES);

  if (queries.length === 0 || !queries[0]) {
    return {
      sources: [],
      searched: false,
      queries,
    };
  }

  /**
   * Run the independent research searches in parallel.
   * A failed query does not fail the entire research run.
   */
  const outcomes = await Promise.allSettled(
    queries.map((q) => gatherSources(q)),
  );

  const pool: NormalizedSource[] = [];

  for (const outcome of outcomes) {
    if (outcome.status === 'fulfilled' && outcome.value.searched) {
      pool.push(...outcome.value.sources);
    }
  }

  if (pool.length === 0) {
    return {
      sources: [],
      searched: false,
      queries,
    };
  }

  /**
   * Deduplicate URLs across all research queries.
   *
   * This is important because the same authoritative source can appear
   * for several different query variations.
   */
  const seen = new Set<string>();
  const deduped: NormalizedSource[] = [];

  for (const source of pool) {
    const key = normalizeUrlForDedupe(source.url);

    if (seen.has(key)) continue;

    seen.add(key);
    deduped.push(source);
  }

  /**
   * Re-rank the combined pool after deduplication so high-quality sources
   * from later research queries can still rise above weaker results.
   */
  const ranked = rankSearchResults(deduped);

  /**
   * Reassign source IDs after the final ranking/truncation so the IDs
   * correspond exactly to the [1], [2], [3]... citation numbers used by
   * the research system prompt.
   */
  const finalSources: NormalizedSource[] = ranked
    .slice(0, MAX_RESEARCH_SOURCES)
    .map((source, index) => ({
      ...source,
      id: `source_${index + 1}`,
    }));

  return {
    sources: finalSources,
    searched: true,
    queries,
  };
}