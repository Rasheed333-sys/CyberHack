import { useState } from 'react';
import { Compass } from 'lucide-react';
import ChatInput from '@/components/chat/ChatInput';
import ResearchStatus from '@/components/research/ResearchStatus';
import SourceList from '@/components/research/SourceCard';
import { renderMarkdown } from '@/utils/markdown';
import { aiService } from '@/services/ai';
import type { Message, ResearchStep } from '@/types';

export default function Research() {
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (prompt: string) => {
    setLoading(true);
    const id = crypto.randomUUID();
    let steps: ResearchStep[] = [];
    setMessage({ id, role: 'assistant', content: '', createdAt: new Date().toISOString(), isStreaming: true });

    const result = await aiService.ask({
      prompt,
      onStep: (step) => {
        const exists = steps.some((s) => s.id === step.id);
        steps = exists ? steps.map((s) => (s.id === step.id ? step : s)) : [...steps, step];
        setMessage((m) => (m ? { ...m, researchSteps: [...steps] } : m));
      },
    });

    setMessage({ ...result.message, id });
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-1">
          <Compass size={16} className="text-cyan" />
          <h2 className="font-mono text-sm uppercase tracking-[0.12em] text-white/70">Multi-source research</h2>
        </div>
        <p className="text-xs text-white/40 mb-6 max-w-lg leading-relaxed">
          Ask CyberHack to research a topic across multiple sources. It searches, cross-checks, and cites everything it
          finds so you can verify the answer yourself.
        </p>

        <ChatInput onSubmit={handleSubmit} loading={loading} />

        {message && (
          <div className="mt-8 border-t border-line pt-6">
            {message.researchSteps && <ResearchStatus steps={message.researchSteps} />}
            <div className="mt-2">{renderMarkdown(message.content || (loading ? '' : ''))}</div>
            {message.sources && <SourceList sources={message.sources} />}
          </div>
        )}
      </div>
    </div>
  );
}