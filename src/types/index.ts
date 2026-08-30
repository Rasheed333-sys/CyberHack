// ────────────────────────────────────────────────────────────────────────
// CyberHack — shared domain types
// These types are the contract between UI components and the service
// layer (src/services/*). Real backend implementations must satisfy the
// same shapes so components never need to change when a mock service is
// swapped for a live one.
// ────────────────────────────────────────────────────────────────────────

export type Role = 'user' | 'assistant' | 'system';

export interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedAt?: string;
}

export interface Citation {
  id: string;
  sourceId: string;
  quote: string;
}

export type ResearchStepStatus = 'pending' | 'active' | 'done' | 'error';

export interface ResearchStep {
  id: string;
  label: string;
  status: ResearchStepStatus;
  detail?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  sources?: Source[];
  citations?: Citation[];
  researchSteps?: ResearchStep[];
  isStreaming?: boolean;
  /** Set when the assistant reply failed. UI renders ErrorState instead of content. */
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
  pinned?: boolean;
}

export type BrowsingMode = 'standard' | 'private' | 'high-privacy';

export interface PrivacyState {
  mode: BrowsingMode;
  ipProtection: boolean;
  dnsProtection: boolean;
  trackerBlocking: boolean;
  cookieIsolation: boolean;
  referrerControl: boolean;
  fingerprintResistance: boolean;
  relayStatus: 'connected' | 'connecting' | 'disconnected';
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

/**
 * Result of a website security/privacy analysis.
 * `isMockData: true` MUST be set by any component or service that has not
 * been backed by a real security engine yet. Components must render a
 * visible "demo data" badge whenever this flag is true — see
 * WebsiteRiskCard.tsx. Never set this to false without a real backend call.
 */
export interface WebsiteRiskAnalysis {
  domain: string;
  ipExposure: 'protected' | 'exposed';
  trackersBlocked: number;
  thirdPartyRequests: number;
  cookiesIsolated: number;
  fingerprintRisk: RiskLevel;
  securityRisk: RiskLevel;
  privacyScore: number; // 0-100
  isMockData: boolean;
  analyzedAt: string;
}

export interface SearchSuggestion {
  id: string;
  label: string;
  kind: 'history' | 'suggestion' | 'action';
}

/**
 * A single mock web search result. isMockData is always true until a real
 * search backend is connected — see src/services/search/index.ts.
 */
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  description: string;
  publishedAt?: string;
  secure: boolean;
  isMockData: boolean;
}

export type SearchPhase = 'idle' | 'searching' | 'analyzing' | 'cross-checking' | 'done' | 'error';

export interface AppSettings {
  conversationStorage: 'local' | 'session-only' | 'off';
  browsingHistory: boolean;
  telemetry: boolean;
  reducedMotion: boolean;
  defaultBrowsingMode: BrowsingMode;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  isAnonymous: boolean;
}