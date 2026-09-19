import { tryComparisonSplit, stripTrailingPunctuation } from './researchPlanner';
import { tokenizeResearchText } from './researchRelevance';
import type { NormalizedSearchResult } from '../search/types';

/**
 * Research intent classification and evidence-fit scoring.
 *
 * Stage 2C's relevance filter (researchRelevance.ts) answers "is this
 * result about the same topic as the query?" via term overlap. That
 * catches obviously off-topic noise, but it can't catch a subtler
 * problem: a result can genuinely be ON topic and still be POOR EVIDENCE
 * for what the question is actually asking. "TCP" appearing on a lighting
 * company's page is on-topic in the shallowest sense (it contains the
 * word "TCP") but answers nothing about how TCP-the-protocol works. This
 * module adds that second, narrower judgment on top of topic relevance —
 * still deterministic, still just query/title/snippet/URL/(bounded)
 * content text, no model call.
 */

export type ResearchIntentType =
  | 'definition'
  | 'mechanism'
  | 'cause'
  | 'comparison'
  | 'current_developments'
  | 'risks'
  | 'benefits'
  | 'drawbacks'
  | 'events'
  | 'identity'
  | 'general';

export interface ResearchIntent {
  type: ResearchIntentType;
  /** Set only for comparison intent — the two things being compared, as written in the query. */
  comparisonEntities?: [string, string];
  /** True if the query itself asks for current/recent information, or names a year. */
  timeSensitive: boolean;
  /** Years explicitly named in the query, e.g. ["2026"]. */
  requestedYears: string[];
}

const TIME_SIGNAL_PATTERN = /\b(latest|recent|recently|current|currently|today|now)\b/i;
const THIS_YEAR_PATTERN = /\bthis\s+year\b/i;

/**
 * Classifies a research question into one practical intent bucket.
 * Order matters: more specific patterns (comparison, risks/benefits) are
 * checked before generic "what is"/"how does" fallbacks, since a query
 * like "what are the major developments..." would otherwise be
 * misclassified as a plain definition question.
 */
export function analyzeResearchIntent(query: string): ResearchIntent {
  const trimmed = stripTrailingPunctuation(query.trim());
  const lower = trimmed.toLowerCase();
  const requestedYears = query.match(/\b(19|20)\d{2}\b/g) ?? [];
  const timeSensitive = requestedYears.length > 0 || TIME_SIGNAL_PATTERN.test(lower) || THIS_YEAR_PATTERN.test(lower);

  const comparison = tryComparisonSplit(trimmed);
  if (comparison) {
    return { type: 'comparison', comparisonEntities: comparison, timeSensitive, requestedYears };
  }
  if (/\b(risks?|threats?|threaten\w*|dangers?|vulnerabilit\w*)\b/i.test(lower)) {
    return { type: 'risks', timeSensitive, requestedYears };
  }
  if (/\b(advantages?|benefits?)\b/i.test(lower)) {
    return { type: 'benefits', timeSensitive, requestedYears };
  }
  if (/\b(disadvantages?|drawbacks?|limitations?)\b/i.test(lower)) {
    return { type: 'drawbacks', timeSensitive, requestedYears };
  }
  if (/\bdevelopments?\b/i.test(lower) || /\btrends?\b/i.test(lower)) {
    // A "developments" question is inherently about the current state of
    // something, even if it doesn't also say "latest"/"recent".
    return { type: 'current_developments', timeSensitive: true, requestedYears };
  }
  if (/^what\s+happened\b/i.test(lower)) {
    return { type: 'events', timeSensitive, requestedYears };
  }
  if (/^who\s+(is|was|are)\b/i.test(lower)) {
    return { type: 'identity', timeSensitive, requestedYears };
  }
  if (/^why\s+(does|do|is|are)\b/i.test(lower)) {
    return { type: 'cause', timeSensitive, requestedYears };
  }
  if (/^how\s+(does|do|is|are)\b/i.test(lower)) {
    return { type: 'mechanism', timeSensitive, requestedYears };
  }
  if (/^what\s+(is|are)\b/i.test(lower)) {
    return { type: 'definition', timeSensitive, requestedYears };
  }
  return { type: 'general', timeSensitive, requestedYears };
}

// ── Evidence reward/penalty vocabulary ──────────────────────────────────
// Small, hand-curated, intent-scoped word sets — not tied to any single
// query's wording, so they generalize across queries of the same intent
// rather than overfitting to one example.

const REWARD_TERMS: Record<ResearchIntentType, ReadonlySet<string>> = {
  definition: new Set(['overview', 'introduction', 'explained', 'guide', 'documentation', 'definition', 'basics', 'fundamentals']),
  mechanism: new Set(['how', 'works', 'architecture', 'mechanism', 'protocol', 'process', 'implementation', 'technical']),
  cause: new Set(['because', 'reason', 'reasons', 'cause', 'causes', 'due', 'results', 'leads', 'mechanism']),
  comparison: new Set(['comparison', 'compare', 'versus', 'difference', 'architecture', 'performance', 'scalability', 'maintainability', 'enterprise']),
  current_developments: new Set(['latest', 'recent', 'announcement', 'development', 'developments', 'update', 'updates', 'roadmap', 'manufacturing', 'investment', 'expansion', 'launch', 'unveil', 'fab', 'foundry']),
  risks: new Set(['risk', 'risks', 'threat', 'threats', 'vulnerability', 'vulnerabilities', 'security', 'attack', 'impact', 'mitigation']),
  benefits: new Set(['advantage', 'advantages', 'benefit', 'benefits', 'pro', 'pros']),
  drawbacks: new Set(['disadvantage', 'disadvantages', 'drawback', 'drawbacks', 'con', 'cons', 'limitation', 'limitations']),
  events: new Set(['announced', 'occurred', 'happened', 'timeline', 'reported']),
  identity: new Set(['ceo', 'leadership', 'executive', 'president', 'founder', 'chief', 'appointed']),
  general: new Set(),
};

// A result that reads like a company directory/profile listing is rarely
// good evidence for a conceptual or technical question — regardless of
// the specific company. This generalizes the "TCP Lighting Company
// Overview, Contact Details & Competitors" failure without naming that
// company, or any company, anywhere in this file. Skipped for 'identity'
// intent, where a legitimate leadership bio can reasonably mention some
// of these words.
const BUSINESS_DIRECTORY_PENALTY_TERMS = new Set([
  'competitors', 'headquarters', 'employees', 'revenue', 'founded', 'address', 'directory', 'profile',
]);

// Comparison-specific: a shopping/product-listing page can genuinely
// contain both compared frameworks (e.g. a book title) without being
// useful comparison evidence. Generic e-commerce vocabulary, not tied to
// any single retailer.
const COMPARISON_PENALTY_TERMS = new Set([
  'price', 'shipping', 'cart', 'paperback', 'hardcover', 'kindle', 'bestseller', 'customers', 'rating', 'ratings',
]);

// Current-developments-specific: a stock/investing page can mention the
// right company and the right year without being evidence of an actual
// manufacturing/technology development.
const CURRENT_DEV_PENALTY_TERMS = new Set([
  'stock', 'shares', 'analyst', 'valuation', 'dividend', 'earnings', 'nasdaq', 'nyse', 'ticker', 'investors',
]);
const CURRENT_DEV_PENALTY_PHRASES = ['share price', 'stock price', 'price target', 'buy rating', 'sell rating', 'market cap'];

const EVIDENCE_REWARD_WEIGHT = 6;
const EVIDENCE_PENALTY_WEIGHT = 15;
const BOTH_ENTITIES_BONUS = 15;
const ONE_ENTITY_IN_CONTEXT_BONUS = 8;
const STALE_TIME_PENALTY = 8;

// How much of a source's already-extracted content (see sourceGatherer.ts)
// to fold into evidence scoring, in addition to title/snippet. Bounded and
// small on purpose: this reuses content CyberHack already fetched for
// synthesis — it triggers no extra requests — but extracted text is
// messier than Tavily's curated title/snippet, so only a modest prefix is
// used, mirroring how EXPANSION_TERM_MULTIPLIER discounts a weaker signal
// in researchRelevance.ts rather than treating it as equally reliable.
const CONTENT_SIGNAL_CHARS = 400;

/**
 * Scores how well a candidate result fits the research question's actual
 * intent — separate from, and additive with, plain topic relevance. A
 * source can score well here even with modest topic-term overlap (e.g.
 * official documentation that doesn't repeat the question's exact
 * wording), and a source can score poorly here despite good topic-term
 * overlap (e.g. a business directory that merely contains the topic word).
 *
 * `content` is optional and, when present, is assumed to already exist on
 * the result (see the module doc comment) — this function never fetches
 * anything itself.
 */
export function scoreIntentEvidence(intent: ResearchIntent, result: NormalizedSearchResult & { content?: string }): number {
  const text = `${result.title} ${result.snippet} ${(result.content ?? '').slice(0, CONTENT_SIGNAL_CHARS)}`.toLowerCase();
  const tokens = new Set(tokenizeResearchText(text));

  let score = 0;

  for (const term of REWARD_TERMS[intent.type]) {
    if (tokens.has(term)) score += EVIDENCE_REWARD_WEIGHT;
  }

  if (intent.type !== 'identity') {
    for (const term of BUSINESS_DIRECTORY_PENALTY_TERMS) {
      if (tokens.has(term)) score -= EVIDENCE_PENALTY_WEIGHT;
    }
  }

  if (intent.type === 'comparison') {
    for (const term of COMPARISON_PENALTY_TERMS) {
      if (tokens.has(term)) score -= EVIDENCE_PENALTY_WEIGHT;
    }
    if (intent.comparisonEntities) {
      const [a, b] = intent.comparisonEntities;
      const mentionsA = text.includes(a.toLowerCase());
      const mentionsB = text.includes(b.toLowerCase());
      if (mentionsA && mentionsB) {
        score += BOTH_ENTITIES_BONUS;
      } else if (mentionsA || mentionsB) {
        // One entity alone is fine (official docs for just one framework
        // are still valuable) — but only counts as strong comparison
        // evidence if the result also uses comparison-relevant vocabulary,
        // not just the entity name in passing.
        const hasComparisonContext = [...REWARD_TERMS.comparison].some((t) => tokens.has(t));
        if (hasComparisonContext) score += ONE_ENTITY_IN_CONTEXT_BONUS;
      }
    }
  }

  if (intent.type === 'current_developments') {
    for (const term of CURRENT_DEV_PENALTY_TERMS) {
      if (tokens.has(term)) score -= EVIDENCE_PENALTY_WEIGHT;
    }
    for (const phrase of CURRENT_DEV_PENALTY_PHRASES) {
      if (text.includes(phrase)) score -= EVIDENCE_PENALTY_WEIGHT;
    }
  }

  if (intent.timeSensitive && intent.requestedYears.length > 0) {
    const mentionsRequestedYear = intent.requestedYears.some((y) => text.includes(y));
    if (!mentionsRequestedYear) score -= STALE_TIME_PENALTY;
  }

  return score;
}