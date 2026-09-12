/**
 * Decides whether a query likely needs fresh web information for AUTO
 * search mode.
 *
 * This intentionally uses a lightweight deterministic heuristic instead of
 * an LLM-based classifier. It is fast, free, predictable, and avoids adding
 * another model/API call just to decide whether to search.
 *
 * The goal is to search when information is likely to be:
 * - current or time-sensitive,
 * - related to changing people/organizations,
 * - dependent on prices, rankings, versions, releases, availability, etc.
 *
 * Ordinary educational/general-knowledge questions should normally remain
 * search-free.
 */

const FRESHNESS_SIGNALS: RegExp[] = [
  // Explicit freshness / time signals.
  /\blatest\b/i,
  /\brecent(ly)?\b/i,
  /\bnews\b/i,
  /\btoday\b/i,
  /\btonight\b/i,
  /\bcurrent(ly)?\b/i,
  /\bright now\b/i,
  /\bthis (week|month|year)\b/i,
  /\bupdate[sd]?\b/i,
  /\b20\d{2}\b/i,

  // Trending / newly changing information.
  /\btrending\b/i,
  /\bwhat('s| is) new\b/i,
  /\bwhat('s| is) happening\b/i,
  /\bwhat happened\b/i,

  // Financial / market information.
  /\bstock price\b/i,
  /\bshare price\b/i,
  /\bmarket cap\b/i,
  /\bexchange rate\b/i,
  /\bprice of\b/i,
  /\bhow much does .* cost\b/i,
  /\bhow much is .* worth\b/i,

  // Weather and live events.
  /\bweather\b/i,
  /\bforecast\b/i,
  /\bscore\b/i,
  /\bscores\b/i,
  /\bstandings\b/i,
  /\bresults?\b/i,
  /\blive\b/i,

  // Software / product versions and releases.
  /\bversion\b/i,
  /\blatest version\b/i,
  /\brelease date\b/i,
  /\breleased\b/i,
  /\blaunch(ed)?\b/i,
  /\bcoming out\b/i,
  /\bavailable\b/i,

  // Time-dependent questions.
  /\bwhen (is|was|did|will)\b/i,
  /\bhow long (until|before)\b/i,

  // Current availability / status.
  /\bis .* still (available|active|open|operating|working)\b/i,
  /\bis .* currently\b/i,
  /\bcurrently available\b/i,
];

/**
 * Questions about people holding roles or leadership positions often need
 * current web verification because those roles can change over time.
 *
 * Examples:
 *   "Who is the CEO of Google?"
 *   "Who is the president of Microsoft?"
 *   "Who is the founder of OpenAI?"
 *
 * We require a role/leadership term rather than searching every "who is"
 * question, so ordinary factual questions such as "Who is Albert Einstein?"
 * don't automatically trigger web search.
 */
const LEADERSHIP_SIGNALS: RegExp[] = [
  /\bwho (is|are|was|were)\b.*\b(ceo|chief executive officer)\b/i,
  /\bwho (is|are|was|were)\b.*\b(president|prime minister|chancellor)\b/i,
  /\bwho (is|are|was|were)\b.*\b(founder|co-founder|cofounder)\b/i,
  /\bwho (is|are|was|were)\b.*\b(owner|co-owner)\b/i,
  /\bwho (is|are|was|were)\b.*\b(chairman|chairperson|chair)\b/i,
  /\bwho (is|are|was|were)\b.*\b(director|managing director)\b/i,
  /\bwho (is|are|was|were)\b.*\b(manager|coach)\b/i,
  /\bwho (is|are|was|were)\b.*\b(secretary|minister)\b/i,

  // Also catch natural phrasing such as:
  // "current CEO of Google"
  // "CEO of Google"
  /\b(current|new|next)\b.*\b(ceo|president|founder|owner|chairman|director)\b/i,
  /\b(ceo|chief executive officer|president|founder|owner|chairman|director)\b.*\bof\b/i,
];

/**
 * Detects questions where the answer is likely to change over time even
 * without an explicit word such as "current" or "latest".
 */
const DYNAMIC_INFORMATION_SIGNALS: RegExp[] = [
  // Availability / operating status.
  /\b(is|are|does|do)\b.*\b(open|closed|available|active|operating)\b/i,

  // Current leadership / employment.
  /\bwho\b.*\bworks? at\b/i,
  /\bwho\b.*\bheads?\b/i,
  /\bwho\b.*\bled\b/i,

  // Rankings / lists that can change.
  /\btop\s+\d+\b/i,
  /\b(best|biggest|largest|smallest|fastest|strongest|most popular)\b.*\b(right now|today|currently)?\b/i,

  // Current product/service state.
  /\bdoes .* support\b/i,
  /\bdoes .* have\b/i,
  /\bis .* supported\b/i,
];

export function shouldAutoSearch(query: string): boolean {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) return false;

  return (
    FRESHNESS_SIGNALS.some((pattern) => pattern.test(normalizedQuery)) ||
    LEADERSHIP_SIGNALS.some((pattern) => pattern.test(normalizedQuery)) ||
    DYNAMIC_INFORMATION_SIGNALS.some((pattern) => pattern.test(normalizedQuery))
  );
}