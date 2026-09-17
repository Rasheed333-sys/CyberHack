import { config } from '../../config';
import { createGroqProvider } from './providers/groqProvider';
import { createMockProvider } from './providers/mockProvider';
import { buildSystemPrompt, buildResearchSystemPrompt } from './systemPrompt';
import type { AIProvider, ChatMessage } from './types';
import type { NormalizedSource } from '../search/types';

let cachedProvider: AIProvider | null = null;

/**
 * Returns the active AI provider. Cached after first call. This is the
 * only place that decides which provider is active — adding a new
 * provider later means adding one branch here, nothing else.
 */
function getProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;
  cachedProvider = config.useMockAI ? createMockProvider() : createGroqProvider();
  return cachedProvider;
}

export async function runChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
  sources: NormalizedSource[] = [],
): Promise<string> {
  const withSystemPrompt: ChatMessage[] = [{ role: 'system', content: buildSystemPrompt(sources) }, ...messages];
  return getProvider().stream(withSystemPrompt, onToken, signal);
}

/**
 * Research-mode synthesis: same provider, same streaming mechanics as
 * runChat(), but built on buildResearchSystemPrompt() — stronger
 * cross-source synthesis instructions for a multi-query research run.
 * runChat() above is untouched; normal Chat/Search behavior is unaffected.
 */
export async function runResearch(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal: AbortSignal | undefined,
  sources: NormalizedSource[],
): Promise<string> {
  const withSystemPrompt: ChatMessage[] = [{ role: 'system', content: buildResearchSystemPrompt(sources) }, ...messages];
  return getProvider().stream(withSystemPrompt, onToken, signal);
}

export function currentProviderName(): string {
  return getProvider().name;
}