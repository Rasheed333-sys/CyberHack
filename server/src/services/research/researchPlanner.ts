/**
 * Deterministic research planner.
 *
 * Converts one research question into a small set of targeted search
 * queries covering different evidence angles, WITHOUT an extra LLM call —
 * cheaper, faster, predictable, and it doesn't spend another Groq request
 * just to decide what to search for. Purely pattern-based over the
 * question's own wording.
 *
 * This is intentionally simple: a few regex-based classifications, not a
 * general-purpose NLP query planner. It doesn't need to be perfect, only
 * sensible — genuinely low-value variations for narrow factual questions
 * are worse than not generating them at all.
 */

const MAX_QUERIES = 5;
const NARROW_FACTUAL_QUERY_COUNT = 2;

// Short, single-clause "who/what/when/where" lookups rarely benefit from
// multiple search angles — one confirming query is enough.
const NARROW_FACTUAL_PATTERNS = [
  /^who\s+is\b/i,
  /^who\s+was\b/i,
  /^what\s+is\s+the\s+capital\s+of\b/i,
  /^when\s+(did|was|is)\b/i,
  /^where\s+is\b/i,
  /^what\s+year\b/i,
  /^how\s+old\s+is\b/i,
];
const NARROW_FACTUAL_MAX_WORDS = 8;

// Matches "compare X with/to/and Y", "X vs Y", "X versus Y", and
// "difference between X and Y", capturing the two things being compared.
const COMPARISON_PATTERNS = [
  /\bcompare\s+(.+?)\s+(?:with|to|and|vs\.?|versus)\s+(.+)/i,
  /\bdifference\s+between\s+(.+?)\s+and\s+(.+)/i,
  /\b(.+?)\s+vs\.?\s+(.+)/i,
  /\b(.+?)\s+versus\s+(.+)/i,
];

// Keeps generated angle-suffix queries from becoming unreasonably long if
// someone pastes a long question — the original question itself (used
// verbatim as the first query) is never truncated.
const MAX_TOPIC_CHARS_FOR_VARIANTS = 200;

export function stripTrailingPunctuation(text: string): string {
  return text.replace(/[?.!]+$/, '').trim();
}

/** Case/whitespace-insensitive dedupe, preserving first-seen order. */
function dedupeQueries(queries: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const q of queries) {
    const trimmed = q.trim();
    const key = trimmed.toLowerCase().replace(/\s+/g, ' ');
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function isNarrowFactual(query: string): boolean {
  const wordCount = query.split(/\s+/).filter(Boolean).length;
  return wordCount <= NARROW_FACTUAL_MAX_WORDS && NARROW_FACTUAL_PATTERNS.some((p) => p.test(query));
}

/**
 * Tries to split a comparison question into its two subjects. Returns null
 * if no pattern matches cleanly. Exported so researchIntent.ts can reuse
 * the exact same comparison detection rather than duplicating it.
 */
export function tryComparisonSplit(topic: string): [string, string] | null {
  for (const pattern of COMPARISON_PATTERNS) {
    const match = topic.match(pattern);
    const a = match?.[1]?.trim();
    const b = match?.[2]?.trim();
    if (a && b && a.length > 1 && b.length > 1 && a.toLowerCase() !== b.toLowerCase()) {
      return [a, b];
    }
  }
  return null;
}

/**
 * Plans the search queries for a research run. Always returns at least
 * one query (the original question, verbatim, first).
 */
export function planResearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [trimmed];

  const topic = stripTrailingPunctuation(trimmed);
  const topicForVariants = topic.length > MAX_TOPIC_CHARS_FOR_VARIANTS ? topic.slice(0, MAX_TOPIC_CHARS_FOR_VARIANTS) : topic;

  if (isNarrowFactual(trimmed)) {
    return dedupeQueries([trimmed, `${topicForVariants} official source`]).slice(0, NARROW_FACTUAL_QUERY_COUNT);
  }

  const comparison = tryComparisonSplit(topicForVariants);
  if (comparison) {
    const [a, b] = comparison;
    return dedupeQueries([trimmed, `${a} overview`, `${b} overview`, `${a} vs ${b} comparison`]).slice(0, MAX_QUERIES);
  }

  // General/broad question — cover a few complementary evidence angles:
  // overview, official/primary sources, recency, and analysis/evidence.
  return dedupeQueries([
    trimmed,
    `${topicForVariants} overview`,
    `${topicForVariants} official information`,
    `${topicForVariants} recent developments`,
    `${topicForVariants} evidence and analysis`,
  ]).slice(0, MAX_QUERIES);
}