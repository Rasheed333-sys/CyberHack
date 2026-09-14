import type { NormalizedSearchResult } from './types';

/**
 * Deterministic source-quality ranking.
 *
 * Tavily already ranks results for relevance — this layer re-orders that
 * output using simple domain/URL signals so authoritative sources (gov,
 * edu, official docs, established research/reference publishers) tend to
 * surface above social media, forums, and generic content when a query
 * turns up a mix of both.
 *
 * IMPORTANT: this is a prioritization heuristic, not a truth or
 * trustworthiness verdict. A high score means "more likely to be a useful,
 * authoritative source for this kind of query" — it does not mean the
 * content is accurate, and a low score does not mean it's wrong. No
 * network calls, no external APIs, no LLM — just static rules over the
 * result metadata Tavily already returned.
 */

// ── Scoring weights ────────────────────────────────────────────────────
// Kept as named constants (rather than inline magic numbers) so the
// relative importance of each signal is easy to see and tune later.
// Quality signals dominate; ORIGINAL_POSITION_WEIGHT is intentionally
// small so Tavily's own relevance ordering only breaks ties between
// similarly-scored results instead of overriding quality signals outright.
const GOV_OR_EDU_BONUS = 40;
const RESEARCH_REFERENCE_BONUS = 35;
const OFFICIAL_DOC_PATH_BONUS = 25;
const REPUTABLE_NEWS_BONUS = 15;
const LOW_PRIORITY_PENALTY = -20;
const ORIGINAL_POSITION_WEIGHT = 1;

// Recognizable research/reference publishers — small, curated, and
// deliberately not exhaustive (see class-level doc comment above).
const RESEARCH_REFERENCE_DOMAINS = new Set([
  'arxiv.org',
  'doi.org',
  'ncbi.nlm.nih.gov',
  'nature.com',
  'sciencedirect.com',
  'ieee.org',
]);

// Established news/reference organizations — a starting set, not a
// judgment that other publishers are unreliable.
const REPUTABLE_NEWS_DOMAINS = new Set(['reuters.com', 'apnews.com', 'bbc.com', 'britannica.com']);

// Social media, forums, and other user-generated-content platforms. These
// are deprioritized, never discarded — a real, relevant answer can still
// live on one of these and it will still appear in results.
const LOW_PRIORITY_DOMAINS = new Set([
  'instagram.com',
  'facebook.com',
  'x.com',
  'twitter.com',
  'reddit.com',
  'quora.com',
]);

// Path fragments that indicate official documentation/reference material,
// regardless of domain (e.g. a vendor's own /docs or /developers section).
const OFFICIAL_DOC_PATH_PATTERNS = [/\/docs?(\/|$)/i, /\/documentation(\/|$)/i, /\/reference(\/|$)/i, /\/developers?(\/|$)/i];

/**
 * Extracts a normalized hostname ("example.com", no "www.") from a URL.
 * Never throws — malformed URLs simply yield an empty hostname, which
 * matches none of the domain sets above and falls through to neutral
 * (zero) domain scoring.
 */
function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

// Matches .gov/.edu and their common country-code variants (e.g. .gov.in,
// .edu.in) plus .ac.<cc> academic domains, without hard-coding every
// country's TLD individually.
function isGovOrEduHostname(hostname: string): boolean {
  if (!hostname) return false;
  return /\.gov(\.[a-z]{2})?$/.test(hostname) || /\.edu(\.[a-z]{2})?$/.test(hostname) || /\.ac\.[a-z]{2}$/.test(hostname);
}

function qualityScore(result: NormalizedSearchResult, hostname: string): number {
  let score = 0;

  if (isGovOrEduHostname(hostname)) score += GOV_OR_EDU_BONUS;
  if (RESEARCH_REFERENCE_DOMAINS.has(hostname)) score += RESEARCH_REFERENCE_BONUS;
  if (OFFICIAL_DOC_PATH_PATTERNS.some((pattern) => pattern.test(result.url))) score += OFFICIAL_DOC_PATH_BONUS;
  if (REPUTABLE_NEWS_DOMAINS.has(hostname)) score += REPUTABLE_NEWS_BONUS;
  if (LOW_PRIORITY_DOMAINS.has(hostname)) score += LOW_PRIORITY_PENALTY;

  return score;
}

/**
 * Reorders search results by a deterministic quality score. Never mutates
 * the input array or its elements — returns a new array of the same
 * result object references, just resorted.
 */
export function rankSearchResults(results: NormalizedSearchResult[]): NormalizedSearchResult[] {
  if (results.length <= 1) return results;

  const scored = results.map((result, index) => {
    const hostname = extractHostname(result.url);
    // Earlier Tavily positions get a small bonus so ties between
    // similarly-scored results preserve Tavily's original relevance call,
    // per "preserve relevance" — this is a tiebreaker, not a driver.
    const positionScore = (results.length - index) * ORIGINAL_POSITION_WEIGHT;
    return { result, score: qualityScore(result, hostname) + positionScore };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.result);
}