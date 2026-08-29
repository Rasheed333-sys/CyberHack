import { create } from 'zustand';
import type {
  AppSettings,
  BrowsingMode,
  Conversation,
  Message,
  PrivacyState,
  User,
} from '@/types';
import { DEFAULT_PRIVACY_STATE } from '@/services/privacy';

interface AppState {
  // user
  user: User | null;
  setUser: (u: User | null) => void;

  // sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  setConversations: (c: Conversation[]) => void;
  startNewConversation: () => string;
  selectConversation: (id: string) => void;
  appendMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, patch: Partial<Message>) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;

  // privacy
  privacyState: PrivacyState;
  setPrivacyState: (p: PrivacyState) => void;
  setBrowsingMode: (mode: BrowsingMode) => void;

  // settings
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  conversationStorage: 'local',
  browsingHistory: true,
  telemetry: false,
  reducedMotion: false,
  defaultBrowsingMode: 'standard',
};

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (u) => set({ user: u }),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  conversations: [],
  currentConversationId: null,
  setConversations: (c) => set({ conversations: c }),

  startNewConversation: () => {
    const id = crypto.randomUUID();
    const conversation: Conversation = {
      id,
      title: 'New conversation',
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    set((s) => ({
      conversations: [conversation, ...s.conversations],
      currentConversationId: id,
    }));
    return id;
  },

  selectConversation: (id) => set({ currentConversationId: id }),

  appendMessage: (conversationId, message) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, message],
              updatedAt: new Date().toISOString(),
              title:
                c.title === 'New conversation' && message.role === 'user'
                  ? message.content.slice(0, 48)
                  : c.title,
            }
          : c,
      ),
    })),

  updateMessage: (conversationId, messageId, patch) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
            }
          : c,
      ),
    })),

  deleteConversation: (id) =>
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      currentConversationId: s.currentConversationId === id ? null : s.currentConversationId,
    })),

  renameConversation: (id, title) =>
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
    })),

  privacyState: DEFAULT_PRIVACY_STATE,
  setPrivacyState: (p) => set({ privacyState: p }),
  setBrowsingMode: (mode) => {
    const isPrivate = mode !== 'standard';
    set({
      privacyState: {
        ...get().privacyState,
        mode,
        ipProtection: isPrivate,
        dnsProtection: isPrivate,
        trackerBlocking: isPrivate,
        cookieIsolation: isPrivate,
        referrerControl: isPrivate,
        fingerprintResistance: mode === 'high-privacy',
        relayStatus: isPrivate ? 'connecting' : 'disconnected',
      },
    });
  },

  settings: DEFAULT_SETTINGS,
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
}));