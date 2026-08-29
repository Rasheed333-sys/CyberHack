// Web retrieval service abstraction — real impl calls VITE_WEB_RETRIEVAL_API_URL
// to fetch and summarize a page server-side (never fetched directly from the
// browser, to avoid leaking the user's IP/referrer to the target site).
import { USE_MOCK_SERVICES, ENDPOINTS, mockDelay } from '@/lib/config';

export interface PageSummary {
  url: string;
  title: string;
  summary: string;
  isMockData: boolean;
}

async function mockSummarize(url: string): Promise<PageSummary> {
  await mockDelay(700);
  return {
    url,
    title: 'Untitled page (mock)',
    summary:
      '[MOCK DATA] Page retrieval and summarization is not connected to a real backend yet. ' +
      'This placeholder shows where a genuine, privacy-routed summary will appear.',
    isMockData: true,
  };
}

async function realSummarize(url: string): Promise<PageSummary> {
  const res = await fetch(`${ENDPOINTS.web}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`Web retrieval error: ${res.status}`);
  return res.json();
}

export const webService = {
  summarize: USE_MOCK_SERVICES ? mockSummarize : realSummarize,
  isMock: USE_MOCK_SERVICES,
};