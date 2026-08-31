import 'dotenv/config';

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value.toLowerCase() === 'true';
}

function parseIntEnv(value: string | undefined, fallback: number): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  port: parseIntEnv(process.env.PORT, 8787),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // When true, the AI service returns canned streamed text instead of
  // calling a real provider. Defaults to true so nobody accidentally spends
  // API credits (or fails loudly) just by starting the server.
  useMockAI: parseBool(process.env.USE_MOCK_AI, true),

  groq: {
    apiKey: process.env.GROQ_API_KEY ?? '',
    model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
  },

  // When true, search returns canned mock results instead of calling a
  // real provider. Defaults to true for the same reason useMockAI does.
  useMockSearch: parseBool(process.env.USE_MOCK_SEARCH, true),

  tavily: {
    apiKey: process.env.TAVILY_API_KEY ?? '',
    baseUrl: 'https://api.tavily.com',
  },

  search: {
    // Results returned by the search provider itself (title/url/snippet
    // only — cheap, no fetching).
    maxResults: parseIntEnv(process.env.SEARCH_MAX_RESULTS, 6),
    // Of those results, how many we actually fetch + extract full text
    // for. Kept smaller than maxResults since fetching is the expensive,
    // slow, riskier (SSRF surface) part.
    sourcesToFetch: parseIntEnv(process.env.SEARCH_SOURCES_TO_FETCH, 4),
    // Extracted characters kept per source before handing it to the model.
    perSourceContextChars: parseIntEnv(process.env.SEARCH_CONTEXT_CHARS_PER_SOURCE, 1500),
    // Hard cap on total source text injected into one AI call, regardless
    // of how many sources were fetched — protects context size and cost.
    maxContextChars: parseIntEnv(process.env.SEARCH_MAX_CONTEXT_CHARS, 6000),
  },

  fetcher: {
    timeoutMs: parseIntEnv(process.env.FETCH_TIMEOUT_MS, 8000),
    maxRedirects: parseIntEnv(process.env.FETCH_MAX_REDIRECTS, 3),
    maxBytes: parseIntEnv(process.env.FETCH_MAX_BYTES, 2_000_000), // 2 MB
  },

  // Search-specific request limits (separate from chat's message limits).
  searchRequest: {
    maxQueryLength: parseIntEnv(process.env.MAX_SEARCH_QUERY_LENGTH, 400),
    maxResultsCeiling: parseIntEnv(process.env.MAX_SEARCH_RESULTS_CEILING, 10),
  },

  // Frontend origins allowed to call this API in production. Empty by
  // default — nothing is allowed until this is explicitly configured.
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  rateLimit: {
    windowMs: parseIntEnv(process.env.RATE_LIMIT_WINDOW_MS, 5 * 60 * 1000),
    max: parseIntEnv(process.env.RATE_LIMIT_MAX, 30),
  },

  limits: {
    maxMessageLength: parseIntEnv(process.env.MAX_MESSAGE_LENGTH, 4000),
    maxMessages: parseIntEnv(process.env.MAX_MESSAGES, 24),
    maxBodyBytes: '100kb',
  },
};

if (config.nodeEnv === 'production' && !config.useMockAI && !config.groq.apiKey) {
  // Fail loudly at boot rather than confusingly on the first real request.
  // eslint-disable-next-line no-console
  console.error(
    '[cyberhack-api] USE_MOCK_AI is false but GROQ_API_KEY is not set. ' +
      'Set GROQ_API_KEY or USE_MOCK_AI=true before starting in production.',
  );
}

if (config.nodeEnv === 'production' && !config.useMockSearch && !config.tavily.apiKey) {
  // eslint-disable-next-line no-console
  console.error(
    '[cyberhack-api] USE_MOCK_SEARCH is false but TAVILY_API_KEY is not set. ' +
      'Set TAVILY_API_KEY or USE_MOCK_SEARCH=true before starting in production.',
  );
}