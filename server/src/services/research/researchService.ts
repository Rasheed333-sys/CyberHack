import { config } from '../../config';
import { gatherSources } from '../search/sourceGatherer';
import { rankSearchResults } from '../search/sourceRanker';
import { planResearch } from './researchPlanner';
import { filterResearchResults } from './researchRelevance';
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

// Light diversity preference: avoid the final set being dominated by many
// pages from one domain. Not a hard one-per-domain rule (some domains
// legitimately deserve two entries), and never enforced so strictly that
// it shrinks the result set below what's actually available — see
// selectDiverseTopSources below.
const MAX_SOURCES_PER_DOMAIN = 2;

/**
 * Selects up to `limit` sources from an already quality-ranked list,
 * preferring not to take more than MAX_SOURCES_PER_DOMAIN from the same
 * domain. If the domain cap would leave the result set short (e.g. almost
 * everything came from one or two domains), backfills from the
 * lower-ranked remainder in rank order rather than under-filling the
 * research budget just to enforce diversity strictly.
 */
function selectDiverseTopSources(ranked: NormalizedSource[], limit: number): NormalizedSource[] {
  const perDomainCount = new Map<string, number>();
  const selected: NormalizedSource[] = [];
  const deferred: NormalizedSource[] = [];

  for (const source of ranked) {
    if (selected.length >= limit) break;
    const count = perDomainCount.get(source.domain) ?? 0;
    if (count < MAX_SOURCES_PER_DOMAIN) {
      selected.push(source);
      perDomainCount.set(source.domain, count + 1);
    } else {
      deferred.push(source);
    }
  }

  for (const source of deferred) {
    if (selected.length >= limit) break;
    selected.push(source);
  }

  return selected;
}

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
 * After merging and cross-query deduplication, results go through
 * relevance filtering (researchRelevance.ts) BEFORE source-quality
 * ranking — an authoritative-but-off-topic source is still excluded, per
 * Stage 2C. Only relevance survivors are quality-ranked and go on to
 * synthesis.
 *
 * gatherSources() assigns "source_N" ids per call, which only makes sense
 * for a single query's own results. Here it runs multiple times, so those
 * per-call ids are discarded and reassigned exactly once — after merging,
 * deduplicating, filtering for relevance, and re-ranking by quality — so
 * the final [1]/[2]/... citation numbers match one coherent, ranked,
 * on-topic source list instead of colliding per-query numbering.
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

  // eslint-disable-next-line no-console
  console.log(`[research] queries=${queries.length} candidates=${pool.length}`);

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

  // Relevance BEFORE quality: filter out results that aren't actually
  // about the research topic, regardless of how authoritative the domain
  // is. See researchRelevance.ts for the scoring/threshold/fallback logic.
  const relevant = filterResearchResults(query, queries, deduped);

  // eslint-disable-next-line no-console
  console.log(`[research] deduped=${deduped.length} relevant=${relevant.length} rejected=${deduped.length - relevant.length}`);

  // Reuse the existing ranker as-is, on the relevance survivors only.
  // rankSearchResults only reads url and reorders — it never mutates
  // elements or fabricates new ones — so the objects coming back are
  // still the same NormalizedSource references; the cast just restores
  // the narrower type the ranker's general NormalizedSearchResult[]
  // signature erased.
  const ranked = rankSearchResults(relevant) as NormalizedSource[];

  const finalSources: NormalizedSource[] = selectDiverseTopSources(ranked, MAX_RESEARCH_SOURCES).map((source, index) => ({
    ...source,
    id: `source_${index + 1}`,
  }));

  // eslint-disable-next-line no-console
  console.log(`[research] final=${finalSources.length}`);

  return { sources: finalSources, searched: true, queries };
}