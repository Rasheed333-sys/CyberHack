import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import ChatWindow from '@/components/chat/ChatWindow';

// Quick web search shares the same chat engine as the main workspace, but
// always starts a fresh conversation with web search enabled by default.
export default function Search() {
  const currentId = useAppStore((s) => s.currentConversationId);
  const startNewConversation = useAppStore((s) => s.startNewConversation);

  useEffect(() => {
    if (!currentId) startNewConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ChatWindow />;
}