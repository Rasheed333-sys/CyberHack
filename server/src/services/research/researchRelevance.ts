import type { NormalizedSearchResult } from '../search/types';

/**
 * Deterministic research relevance filter.
 *
 * A source appearing in Tavily's results for one of the research planner's
 * queries does not mean it's actually about the research topic — Tavily
 * candidate lists commonly include tangential results (a keynote video
 * that happens to share the same year, an unrelated org with a similar
 * name, a generic aggregator page). This module scores each candidate's
 * textual overlap with the research topic and filters out results that
 * don't clear a minimum bar, BEFORE source-quality ranking runs — an
 * authoritative-but-irrelevant page is still a bad research source.
 *
 * Deliberately simple: pure token-overlap + a couple of well-scoped
 * bonuses. No embeddings, no ML classifier, no extra LLM call.
 *
 * One deliberate refinement worth calling out: query terms are NOT
 * weighted equally. The word(s) that open a question are usually just its
 * subject ("quantum computing", "React vs Angular") and, on their own,
 * match a lot of only-loosely-related content about the same broad field.
 * The words that follow tend to carry the question's actual, more
 * specific angle ("...threaten current cryptography"). Later query terms
 * are weighted higher for exactly this reason — see POSITION_WEIGHT_*
 * below. This is a crude heuristic, not a syntactic parse, but it's
 * simple, deterministic, and it measurably fixes real false positives
 * (verified against this project's actual reported failure cases, not
 * just reasoned about).
 */

// ── Stopwords ──────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'as',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'this', 'that', 'these', 'those',
  'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why',
  'does', 'do', 'did', 'has', 'have', 'had', 'will', 'would', 'can', 'could', 'should', 'shall',
  'it', 'its', 'their', 'they', 'them', 'about', 'into', 'than', 'then',
  'vs', 'versus', // query-structure words for comparisons, not topical content
]);

const MIN_TOKEN_LENGTH = 2;
const YEAR_PATTERN = /^(19|20)\d{2}$/;

/**
 * Lowercases, strips punctuation, splits on whitespace, and drops
 * stopwords and very short fragments. This is a general-purpose tokenizer
 * — it intentionally still includes year-like tokens (e.g. "2026"); the
 * scoring logic below handles years through its own dedicated bonus
 * channel instead, so it doesn't reward the same year mention twice.
 */
export function tokenizeResearchText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(t));
}

/** Extracts 4-digit years (1900–2099) mentioned in text, e.g. from a query containing "2026". */
function extractYears(text: string): string[] {
  return text.match(/\b(19|20)\d{2}\b/g) ?? [];
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

// ── Scoring weights ────────────────────────────────────────────────────
const TITLE_TERM_WEIGHT = 12; // per meaningful term found in the result title, before position weighting
const SNIPPET_TERM_WEIGHT = 5; // per meaningful term found in the snippet, before position weighting
const DOMAIN_TERM_WEIGHT = 8; // a query term appearing in the hostname itself — a lightweight, safe stand-in
// for "this looks like an official/entity-specific source," without a hardcoded company→domain dictionary.
const EXPANSION_TERM_MULTIPLIER = 0.5; // terms that only came from the planner's expansion queries (not the
// original question) count at half weight — still useful vocabulary, but the original question's own wording
// should dominate the score.
const PHRASE_MATCH_BONUS = 20; // a significant two-word phrase from the query appears together in title/snippet
const YEAR_MATCH_BONUS = 10; // query mentions a year (e.g. "2026") and that same year appears in the result

// Position weighting for the original question's own terms — later terms
// weight up to POSITION_WEIGHT_MAX, the opening word(s) only
// POSITION_WEIGHT_MIN. See the module doc comment for why.
const POSITION_WEIGHT_MIN = 0.6;
const POSITION_WEIGHT_MAX = 1.4;

// The relevance bar scales with how many meaningful terms the original
// question actually has. A flat threshold is miscalibrated: a narrow
// two-term question ("CEO", "Google") has a much lower achievable maximum
// score than a five-term question, so the same absolute bar is
// disproportionately strict for short queries and too lax for long ones.
const RELEVANCE_THRESHOLD_PER_TERM = 5;
const MIN_RELEVANCE_THRESHOLD = 10;
const MAX_RELEVANCE_THRESHOLD = 40;

function relevanceThreshold(primaryTermCount: number): number {
  const scaled = RELEVANCE_THRESHOLD_PER_TERM * primaryTermCount;
  return Math.min(MAX_RELEVANCE_THRESHOLD, Math.max(MIN_RELEVANCE_THRESHOLD, scaled));
}

// If literally nothing clears the threshold, keep this many of the
// least-bad candidates rather than returning an empty pool — research
// should still proceed and let the AI acknowledge weak evidence, per the
// required fallback behavior, instead of silently producing no answer.
const MIN_RETAINED_FALLBACK = 3;

export interface Vocabulary {
  /** Meaningful terms from the original question, mapped to a position-based weight multiplier. */
  primary: Map<string, number>;
  /** Additional terms introduced only by the planner's expansion queries — always at half weight. */
  expansion: Set<string>;
  /**
   * Two-word phrases from the original question, EXCLUDING the leading
   * bigram — the query's opening words are usually just its subject
   * ("quantum computing"), which matches too much loosely-related content
   * to deserve an extra phrase bonus; later phrases tend to carry the
   * question's actual specific angle and still get one.
   */
  phrases: string[];
  years: string[];
}

/** Builds the scoring vocabulary once per research run. See the module doc comment and Vocabulary fields above. */
export function buildVocabulary(originalQuery: string, allPlannedQueries: string[]): Vocabulary {
  const words = originalQuery
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(w) && !YEAR_PATTERN.test(w));

  const primary = new Map<string, number>();
  words.forEach((w, i) => {
    const multiplier =
      words.length > 1 ? POSITION_WEIGHT_MIN + (i / (words.length - 1)) * (POSITION_WEIGHT_MAX - POSITION_WEIGHT_MIN) : 1;
    // A repeated word keeps the highest multiplier it earns at any position.
    primary.set(w, Math.max(primary.get(w) ?? 0, multiplier));
  });

  const expansion = new Set<string>();
  for (const q of allPlannedQueries) {
    for (const t of tokenizeResearchText(q)) {
      if (!primary.has(t) && !YEAR_PATTERN.test(t)) expansion.add(t);
    }
  }

  const phrases: string[] = [];
  for (let i = 1; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
  }

  return { primary, expansion, phrases, years: extractYears(originalQuery) };
}

/** Scores one candidate result against the research vocabulary. Higher = more relevant. */
export function scoreResearchRelevance(vocabulary: Vocabulary, result: NormalizedSearchResult): number {
  const titleTokens = new Set(tokenizeResearchText(result.title));
  const snippetTokens = new Set(tokenizeResearchText(result.snippet));
  const hostname = safeHostname(result.url);

  let score = 0;

  const scoreTermSet = (terms: Set<string>, weight: number) => {
    for (const [term, multiplier] of vocabulary.primary) {
      if (terms.has(term)) score += weight * multiplier;
    }
    for (const term of vocabulary.expansion) {
      if (terms.has(term)) score += weight * EXPANSION_TERM_MULTIPLIER;
    }
  };

  scoreTermSet(titleTokens, TITLE_TERM_WEIGHT);
  scoreTermSet(snippetTokens, SNIPPET_TERM_WEIGHT);

  if (hostname) {
    for (const [term, multiplier] of vocabulary.primary) {
      if (hostname.includes(term)) score += DOMAIN_TERM_WEIGHT * multiplier;
    }
  }

  const titleAndSnippet = `${result.title} ${result.snippet}`.toLowerCase();
  for (const phrase of vocabulary.phrases) {
    if (titleAndSnippet.includes(phrase)) score += PHRASE_MATCH_BONUS;
  }
  for (const year of vocabulary.years) {
    if (titleAndSnippet.includes(year)) score += YEAR_MATCH_BONUS;
  }

  return score;
}

/**
 * Filters a candidate pool down to results relevant to the research topic.
 * Scores everything, keeps what clears RELEVANCE_THRESHOLD, and — only if
 * absolutely nothing clears it — falls back to the top MIN_RETAINED_FALLBACK
 * candidates so a research run never dead-ends into zero evidence just
 * because every candidate was a mediocre partial match.
 */
export function filterResearchResults<T extends NormalizedSearchResult>(
  originalQuery: string,
  allPlannedQueries: string[],
  results: T[],
): T[] {
  if (results.length === 0) return results;

  const vocabulary = buildVocabulary(originalQuery, allPlannedQueries);
  const scored = results
    .map((result) => ({ result, score: scoreResearchRelevance(vocabulary, result) }))
    .sort((a, b) => b.score - a.score);

  const threshold = relevanceThreshold(vocabulary.primary.size);
  const passing = scored.filter((s) => s.score >= threshold);
  if (passing.length > 0) return passing.map((s) => s.result);

  return scored.slice(0, MIN_RETAINED_FALLBACK).map((s) => s.result);
}