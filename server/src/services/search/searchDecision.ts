/**
 * Decides whether a query likely needs fresh web information, for AUTO
 * search mode. This is a deliberately simple keyword/pattern heuristic —
 * not an LLM-based classifier — per this phase's "do not build an overly
 * complicated autonomous agent yet" requirement. It's fast, free, and
 * predictable, but it WILL misclassify some queries (e.g. it won't catch
 * "is the Eiffel Tower still the tallest structure in Paris" as needing a
 * search, and might over-trigger on something like "what's new in Python
 * 3.12" when the model may already know). A smarter router (e.g. a small
 * classification call, or letting the model itself request search via
 * tool-calling) is a natural improvement for a later version.
 */
const FRESHNESS_SIGNALS: RegExp[] = [
  /\blatest\b/i,
  /\brecent(ly)?\b/i,
  /\bnews\b/i,
  /\btoday\b/i,
  /\btonight\b/i,
  /\bcurrent(ly)?\b/i,
  /\bright now\b/i,
  /\bthis (week|month|year)\b/i,
  /\bupdate[sd]?\b/i,
  /\b20\d{2}\b/, // any explicit 4-digit year
  /\bwho (is|are) the current\b/i,
  /\bwhat(\'s| is) (happening|new|trending)\b/i,
  /\bstock price\b/i,
  /\bweather\b/i,
  /\bscore\b/i,
  /\brelease date\b/i,
  /\bwhen (is|was|did|will)\b/i,
  /\bhow much (is|does|are|costs?)\b/i,
  /\bversion\b/i,
  /\bannounc(ed|ement)\b/i,
];

export function shouldAutoSearch(query: string): boolean {
  return FRESHNESS_SIGNALS.some((pattern) => pattern.test(query));
}