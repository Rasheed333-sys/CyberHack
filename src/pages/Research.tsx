import { useState } from 'react';
import { Compass } from 'lucide-react';
import ChatInput from '@/components/chat/ChatInput';
import ResearchTimeline from '@/components/research/ResearchTimeline';
import SourceList from '@/components/research/SourceCard';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Panel from '@/components/ui/Panel';
import { renderMarkdown } from '@/utils/markdown';
import { aiService } from '@/services/ai';
import type { Message, ResearchStep } from '@/types';

export default function Research() {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (prompt: string) => {
    setLoading(true);
    setError(false);
    setQuery(prompt);
    const id = crypto.randomUUID();
    let steps: ResearchStep[] = [];
    setMessage({ id, role: 'assistant', content: '', createdAt: new Date().toISOString(), isStreaming: true });

    try {
      const result = await aiService.ask({
        prompt,
        onStep: (step) => {
          const exists = steps.some((s) => s.id === step.id);
          steps = exists ? steps.map((s) => (s.id === step.id ? step : s)) : [...steps, step];
          setMessage((m) => (m ? { ...m, researchSteps: [...steps] } : m));
        },
      });
      setMessage({ ...result.message, id });
    } catch {
      setError(true);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <SectionHeader
          eyebrow="Deep research"
          title="Multi-source research workspace"
          description="CyberHack plans a research path, searches multiple sources, cross-checks findings, and synthesizes a cited answer."
          icon={<Compass size={16} className="text-cyan" />}
        />

        <ChatInput onSubmit={handleSubmit} loading={loading} />

        {!message && !loading && !error && (
          <EmptyState
            icon={<Compass size={16} />}
            title="No active research"
            description="Ask a question above to start a multi-source research run."
          />
        )}

        {error && <ErrorState message="CyberHack couldn't complete this research run." onRetry={() => handleSubmit(query)} />}

        {message && (
          <div className="space-y-5">
            <Panel title="Research query">
              <p className="px-4 py-3 text-sm text-white/80">{query}</p>
            </Panel>

            {message.researchSteps && (
              <Panel title="System status" padded>
                <ResearchTimeline steps={message.researchSteps} />
              </Panel>
            )}

            {message.content && (
              <Panel title="Synthesis" padded>
                {renderMarkdown(message.content)}
                {message.sources && <SourceList sources={message.sources} />}
              </Panel>
            )}
          </div>
        )}
      </div>
    </div>
  );
}