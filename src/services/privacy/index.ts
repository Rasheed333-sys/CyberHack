// Privacy Gateway service abstraction — real impl calls VITE_PRIVACY_GATEWAY_URL
// and will eventually front a relay / Tor abstraction layer. Until that
// backend exists, this returns a static, clearly-scoped default state and
// makes NO claim of active protection beyond what is genuinely implemented
// in this demo (i.e. none — the frontend cannot protect network traffic by
// itself).
import { USE_MOCK_SERVICES, ENDPOINTS, mockDelay } from '@/lib/config';
import type { BrowsingMode, PrivacyState } from '@/types';

export const DEFAULT_PRIVACY_STATE: PrivacyState = {
  mode: 'standard',
  ipProtection: false,
  dnsProtection: false,
  trackerBlocking: false,
  cookieIsolation: false,
  referrerControl: false,
  fingerprintResistance: false,
  relayStatus: 'disconnected',
};

async function mockGetState(): Promise<PrivacyState> {
  await mockDelay(200);
  return DEFAULT_PRIVACY_STATE;
}

async function mockSetMode(mode: BrowsingMode): Promise<PrivacyState> {
  await mockDelay(400);
  // NOTE: this only updates local UI state. No real network protection is
  // applied until a Privacy Gateway backend is connected.
  const isPrivate = mode !== 'standard';
  return {
    mode,
    ipProtection: isPrivate,
    dnsProtection: isPrivate,
    trackerBlocking: isPrivate,
    cookieIsolation: isPrivate,
    referrerControl: isPrivate,
    fingerprintResistance: mode === 'high-privacy',
    relayStatus: isPrivate ? 'connecting' : 'disconnected',
  };
}

async function realGetState(): Promise<PrivacyState> {
  const res = await fetch(`${ENDPOINTS.privacy}/state`);
  if (!res.ok) throw new Error(`Privacy gateway error: ${res.status}`);
  return res.json();
}

async function realSetMode(mode: BrowsingMode): Promise<PrivacyState> {
  const res = await fetch(`${ENDPOINTS.privacy}/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new Error(`Privacy gateway error: ${res.status}`);
  return res.json();
}

export const privacyService = {
  getState: USE_MOCK_SERVICES ? mockGetState : realGetState,
  setMode: USE_MOCK_SERVICES ? mockSetMode : realSetMode,
  isMock: USE_MOCK_SERVICES,
};