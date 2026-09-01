// ────────────────────────────────────────────────────────────────────────
// Central place that decides whether the app talks to mock services or
// real backend endpoints. Every service module reads this instead of
// checking import.meta.env directly, so the switch-over is one line.
// ────────────────────────────────────────────────────────────────────────

// Case-insensitive, whitespace-tolerant: "false", "False", "FALSE", or
// " false " all correctly disable mock mode. A strict `!== 'false'` check
// silently stayed in mock mode for anyone who typed "False" (a natural
// typo, especially coming from Python) — this class of misconfiguration
// is exactly the kind of thing that must fail safe, not fail silent.
function isExplicitlyFalse(value: string | undefined): boolean {
  return value !== undefined && value.trim().toLowerCase() === 'false';
}

export const USE_MOCK_SERVICES = !isExplicitlyFalse(import.meta.env.VITE_USE_MOCK_SERVICES);

// The AI chat backend is switched independently from the other (still
// mock) services below, so the real backend can be turned on for chat
// without needing search/privacy/security backends to exist yet.
export const USE_MOCK_AI = !isExplicitlyFalse(import.meta.env.VITE_USE_MOCK_AI);

// Web search (the Search page's searchService.search — not the chat AI's
// own built-in search, which is entirely server-side) is switched the
// same way, independently from USE_MOCK_SERVICES.
export const USE_MOCK_SEARCH = !isExplicitlyFalse(import.meta.env.VITE_USE_MOCK_SEARCH);

export const ENDPOINTS = {
  ai: import.meta.env.VITE_AI_GATEWAY_URL ?? '',
  search: import.meta.env.VITE_SEARCH_API_URL ?? '',
  web: import.meta.env.VITE_WEB_RETRIEVAL_API_URL ?? '',
  privacy: import.meta.env.VITE_PRIVACY_GATEWAY_URL ?? '',
  security: import.meta.env.VITE_SECURITY_API_URL ?? '',
  auth: import.meta.env.VITE_AUTH_API_URL ?? '',
};

/** Small helper to simulate network latency in mock services. */
export function mockDelay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}