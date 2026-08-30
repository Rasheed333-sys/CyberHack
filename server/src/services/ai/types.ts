export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/**
 * A provider-independent AI adapter. Any provider (Groq, OpenAI-compatible
 * endpoints, a future local model, etc.) implements this same shape, so
 * swapping providers never requires touching routes or the frontend.
 */
export interface AIProvider {
  /** Short identifier, useful for logs — never sent to the client. */
  name: string;
  /**
   * Streams a completion for the given messages, calling onToken for each
   * text chunk as it arrives, and resolving with the full accumulated text.
   */
  stream(messages: ChatMessage[], onToken: (token: string) => void, signal?: AbortSignal): Promise<string>;
}