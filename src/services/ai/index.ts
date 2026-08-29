// ────────────────────────────────────────────────────────────────────────
// AI Orchestrator service abstraction.
//
// Real implementation (not yet connected): should call VITE_AI_GATEWAY_URL,
// a backend endpoint that performs tool-calling / planning / streaming and
// NEVER exposes a model provider API key to the browser.
//
// Mock implementation: returns canned, clearly-labelled responses so the
// UI can be built and demoed before the backend exists.
// ────────────────────────────────────────────────────────────────────────

import { USE_MOCK_SERVICES, ENDPOINTS, mockDelay } from '@/lib/config';
import type { Message, ResearchStep, Source } from '@/types';

export interface AskParams {
  prompt: string;
  conversationId?: string;
  onStep?: (step: ResearchStep) => void;
  onToken?: (partial: string) => void;
}

export interface AskResult {
  message: Message;
}

const MOCK_SOURCES: Source[] = [
  {
    id: 'src-1',
    title: 'Understanding Zero-Knowledge Proofs',
    url: 'https://example-research.dev/zkp-overview',
    domain: 'example-research.dev',
    snippet: 'A technical overview of zero-knowledge proof systems and their use in privacy-preserving verification.',
  },
  {
    id: 'src-2',
    title: 'Tracker Blocking Techniques in Modern Browsers',
    url: 'https://example-privacy.org/tracker-blocking',
    domain: 'example-privacy.org',
    snippet: 'A comparison of tracker blocking strategies used by privacy-focused browsers.',
  },
  {
    id: 'src-3',
    title: 'Onion Routing and Relay Networks',
    url: 'https://example-network.io/onion-routing',
    domain: 'example-network.io',
    snippet: 'Explains how multi-hop relay networks reduce (without eliminating) traffic correlation risk.',
  },
];

async function mockAsk({ prompt, onStep, onToken }: AskParams): Promise<AskResult> {
  const steps: ResearchStep[] = [
    { id: 's1', label: 'Searching the web', status: 'active' },
    { id: 's2', label: 'Analyzing sources', status: 'pending' },
    { id: 's3', label: 'Cross-checking information', status: 'pending' },
    { id: 's4', label: 'Research complete', status: 'pending' },
  ];

  for (let i = 0; i < steps.length; i++) {
    await mockDelay(500);
    steps[i].status = 'done';
    if (i + 1 < steps.length) steps[i + 1].status = 'active';
    onStep?.({ ...steps[i] });
  }

  const responseText =
    `[MOCK RESPONSE] This is placeholder output from the mock AI service — no real model or ` +
    `search backend is connected yet. Your request was: "${prompt}". Once the AI Orchestrator ` +
    `(see /services/ai) is wired to a real backend, this will be a genuine, cited answer.`;

  if (onToken) {
    const words = responseText.split(' ');
    for (const w of words) {
      await mockDelay(18);
      onToken(w + ' ');
    }
  }

  return {
    message: {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: responseText,
      createdAt: new Date().toISOString(),
      sources: MOCK_SOURCES,
      researchSteps: steps,
    },
  };
}

async function realAsk(params: AskParams): Promise<AskResult> {
  const res = await fetch(`${ENDPOINTS.ai}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: params.prompt, conversationId: params.conversationId }),
  });
  if (!res.ok) throw new Error(`AI gateway error: ${res.status}`);
  return res.json();
}

export const aiService = {
  ask: USE_MOCK_SERVICES ? mockAsk : realAsk,
  isMock: USE_MOCK_SERVICES,
};