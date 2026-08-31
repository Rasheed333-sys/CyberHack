import { config } from '../config';
import type { ChatMessage } from '../services/ai/types';

export interface ValidationError {
  code: string;
  message: string;
}

export type SearchMode = 'auto' | 'web' | 'chat';

export type ValidationResult = { messages: ChatMessage[]; mode: SearchMode } | { error: ValidationError };

export function validateChatBody(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { error: { code: 'INVALID_BODY', message: 'Request body must be a JSON object.' } };
  }

  const { messages, mode } = body as { messages?: unknown; mode?: unknown };

  if (mode !== undefined && mode !== 'auto' && mode !== 'web' && mode !== 'chat') {
    return { error: { code: 'INVALID_MODE', message: '"mode" must be one of "auto", "web", or "chat".' } };
  }
  const resolvedMode: SearchMode = (mode as SearchMode | undefined) ?? 'auto';

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: { code: 'INVALID_MESSAGES', message: '"messages" must be a non-empty array.' } };
  }

  if (messages.length > config.limits.maxMessages) {
    return {
      error: {
        code: 'TOO_MANY_MESSAGES',
        message: `Conversation is too long (max ${config.limits.maxMessages} messages per request).`,
      },
    };
  }

  const cleaned: ChatMessage[] = [];

  for (const raw of messages) {
    if (!raw || typeof raw !== 'object') {
      return { error: { code: 'INVALID_MESSAGE', message: 'Each message must be an object.' } };
    }
    const { role, content } = raw as { role?: unknown; content?: unknown };

    if (role !== 'user' && role !== 'assistant') {
      return { error: { code: 'INVALID_ROLE', message: 'Message "role" must be "user" or "assistant".' } };
    }
    if (typeof content !== 'string' || content.trim().length === 0) {
      return { error: { code: 'EMPTY_MESSAGE', message: 'Message "content" must be a non-empty string.' } };
    }
    if (content.length > config.limits.maxMessageLength) {
      return {
        error: {
          code: 'MESSAGE_TOO_LONG',
          message: `A message exceeds the ${config.limits.maxMessageLength} character limit.`,
        },
      };
    }
    cleaned.push({ role, content: content.trim() });
  }

  if (cleaned[cleaned.length - 1].role !== 'user') {
    return { error: { code: 'INVALID_LAST_MESSAGE', message: 'The last message must be from the user.' } };
  }

  return { messages: cleaned, mode: resolvedMode };
}