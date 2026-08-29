import { useState } from 'react';
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, User as UserIcon } from 'lucide-react';
import type { Message } from '@/types';
import { renderMarkdown } from '@/utils/markdown';
import ResearchStatus from '@/components/research/ResearchStatus';
import SourceList from '@/components/research/SourceCard';
import StreamingIndicator from './StreamingIndicator';
import { cn } from '@/utils/cn';

export default function ChatMessage({ message, onRegenerate }: { message: Message; onRegenerate?: () => void }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isUser) {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[85%] sm:max-w-[70%] rounded-sm bg-void-800 border border-line px-3.5 py-2.5">
          <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        <div className="h-7 w-7 rounded-full bg-void-800 border border-line flex items-center justify-center shrink-0">
          <UserIcon size={13} className="text-white/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="h-7 w-7 rounded-sm border border-neon/30 bg-neon/5 flex items-center justify-center shrink-0">
        <span className="text-neon font-mono text-[11px] font-bold">C</span>
      </div>
      <div className="min-w-0 flex-1">
        {message.researchSteps && <ResearchStatus steps={message.researchSteps} />}
        <div className={cn('max-w-none', message.isStreaming && 'opacity-95')}>
          {renderMarkdown(message.content)}
          {message.isStreaming && <StreamingIndicator />}
        </div>
        {message.sources && <SourceList sources={message.sources} />}

        {!message.isStreaming && (
          <div className="flex items-center gap-1 mt-2 -ml-1.5">
            <button
              onClick={handleCopy}
              className="h-7 w-7 flex items-center justify-center rounded-sm text-white/35 hover:text-neon hover:bg-void-800 transition-colors"
              aria-label="Copy response"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <button
              onClick={onRegenerate}
              className="h-7 w-7 flex items-center justify-center rounded-sm text-white/35 hover:text-neon hover:bg-void-800 transition-colors"
              aria-label="Regenerate response"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={cn(
                'h-7 w-7 flex items-center justify-center rounded-sm hover:bg-void-800 transition-colors',
                feedback === 'up' ? 'text-neon' : 'text-white/35 hover:text-neon',
              )}
              aria-label="Good response"
            >
              <ThumbsUp size={13} />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={cn(
                'h-7 w-7 flex items-center justify-center rounded-sm hover:bg-void-800 transition-colors',
                feedback === 'down' ? 'text-warn' : 'text-white/35 hover:text-warn',
              )}
              aria-label="Bad response"
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}