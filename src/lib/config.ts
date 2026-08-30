// ────────────────────────────────────────────────────────────────────────
// Central place that decides whether the app talks to mock services or
// real backend endpoints. Every service module reads this instead of
// checking import.meta.env directly, so the switch-over is one line.
// ────────────────────────────────────────────────────────────────────────

export const USE_MOCK_SERVICES =
  (import.meta.env.VITE_USE_MOCK_SERVICES ?? 'true') !== 'false';

// The AI chat backend is switched independently from the other (still
// mock) services below, so the real backend can be turned on for chat
// without needing search/privacy/security backends to exist yet.
export const USE_MOCK_AI = (import.meta.env.VITE_USE_MOCK_AI ?? 'true') !== 'false';

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