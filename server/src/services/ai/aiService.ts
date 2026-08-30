import { config } from '../../config';
import { createGroqProvider } from './providers/groqProvider';
import { createMockProvider } from './providers/mockProvider';
import { SYSTEM_PROMPT } from './systemPrompt';
import type { AIProvider, ChatMessage } from './types';

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
): Promise<string> {
  const withSystemPrompt: ChatMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];
  return getProvider().stream(withSystemPrompt, onToken, signal);
}

export function currentProviderName(): string {
  return getProvider().name;
}