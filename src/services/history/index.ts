// History service abstraction — stores/retrieves conversations. Real impl
// should respect the user's "browsingHistory" and "conversationStorage"
// settings (see /services/auth, AppSettings type) rather than persisting
// everything unconditionally.
import type { Conversation } from '@/types';

const STORAGE_KEY = 'cyberhack.conversations.v1';

function readLocal(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // storage unavailable — fail silently, conversation stays in memory only
  }
}

export const historyService = {
  list: async (): Promise<Conversation[]> => readLocal(),
  save: async (conversations: Conversation[]): Promise<void> => writeLocal(conversations),
  clear: async (): Promise<void> => localStorage.removeItem(STORAGE_KEY),
};