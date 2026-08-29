// Security engine service abstraction — real impl calls VITE_SECURITY_API_URL
// for phishing/malicious-URL detection and site risk analysis.
//
// IMPORTANT: mockAnalyze() returns fabricated numbers for UI development
// only. Every result it returns has isMockData: true, and UI components
// (see WebsiteRiskCard) MUST surface a visible "Demo data" badge whenever
// that flag is set. Never present mock output as a real analysis.
import { USE_MOCK_SERVICES, ENDPOINTS, mockDelay } from '@/lib/config';
import type { WebsiteRiskAnalysis } from '@/types';

function hashScore(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

async function mockAnalyze(domain: string): Promise<WebsiteRiskAnalysis> {
  await mockDelay(900);
  const seed = hashScore(domain);
  const score = 55 + (seed % 40); // 55-94, deterministic per-domain demo value
  return {
    domain,
    ipExposure: 'protected',
    trackersBlocked: seed % 20,
    thirdPartyRequests: (seed >> 3) % 15,
    cookiesIsolated: (seed >> 5) % 8,
    fingerprintRisk: score > 80 ? 'low' : score > 60 ? 'medium' : 'high',
    securityRisk: score > 75 ? 'low' : score > 50 ? 'medium' : 'high',
    privacyScore: score,
    isMockData: true,
    analyzedAt: new Date().toISOString(),
  };
}

async function realAnalyze(domain: string): Promise<WebsiteRiskAnalysis> {
  const res = await fetch(`${ENDPOINTS.security}/analyze?domain=${encodeURIComponent(domain)}`);
  if (!res.ok) throw new Error(`Security engine error: ${res.status}`);
  return res.json();
}

export const securityService = {
  analyze: USE_MOCK_SERVICES ? mockAnalyze : realAnalyze,
  isMock: USE_MOCK_SERVICES,
};