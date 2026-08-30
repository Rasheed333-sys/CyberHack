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