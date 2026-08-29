import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { aiService } from '@/services/ai';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import type { Message, ResearchStep } from '@/types';

export default function ChatWindow() {
  const currentId = useAppStore((s) => s.currentConversationId);
  const conversations = useAppStore((s) => s.conversations);
  const appendMessage = useAppStore((s) => s.appendMessage);
  const updateMessage = useAppStore((s) => s.updateMessage);
  const startNewConversation = useAppStore((s) => s.startNewConversation);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === currentId) ?? null;
  const messages = conversation?.messages ?? [];

  const lastMessageContent = messages[messages.length - 1]?.content;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, lastMessageContent]);

  const runAssistantReply = async (conversationId: string, prompt: string) => {
    const assistantId = crypto.randomUUID();
    appendMessage(conversationId, {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
      researchSteps: [],
    });

    let streamed = '';
    await aiService.ask({
      prompt,
      conversationId,
      onStep: (step: ResearchStep) => {
        updateMessage(conversationId, assistantId, {
          researchSteps: mergeSteps(step),
        });
      },
      onToken: (partial) => {
        streamed += partial;
        updateMessage(conversationId, assistantId, { content: streamed, isStreaming: true });
      },
    });

    updateMessage(conversationId, assistantId, { isStreaming: false });

    function mergeSteps(step: ResearchStep): ResearchStep[] {
      const current = conversations.find((c) => c.id === conversationId)?.messages.find((m) => m.id === assistantId)
        ?.researchSteps ?? [];
      const exists = current.some((s) => s.id === step.id);
      return exists ? current.map((s) => (s.id === step.id ? step : s)) : [...current, step];
    }
  };

  const handleSend = async (text: string) => {
    const id = currentId ?? startNewConversation();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    appendMessage(id, userMessage);
    await runAssistantReply(id, text);
  };

  if (!conversation || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <WelcomeScreen />
        <div className="px-4 sm:px-6 pb-6 sm:pb-8 max-w-3xl w-full mx-auto">
          <ChatInput onSubmit={handleSend} autoFocus />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} onRegenerate={() => runAssistantReply(conversation.id, m.content)} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="px-4 sm:px-6 pb-5 pt-2 border-t border-line">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSubmit={handleSend} />
        </div>
      </div>
    </div>
  );
}