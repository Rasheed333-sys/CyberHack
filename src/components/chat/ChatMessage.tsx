import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, User as UserIcon } from 'lucide-react';
import type { Message } from '@/types';
import { renderMarkdown } from '@/utils/markdown';
import ResearchStatus from '@/components/research/ResearchStatus';
import SourceList from '@/components/research/SourceCard';
import StreamingIndicator from './StreamingIndicator';
import IconButton from '@/components/ui/IconButton';
import ErrorState from '@/components/ui/ErrorState';
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
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex gap-3 justify-end"
      >
        <div className="max-w-[85%] sm:max-w-[70%] rounded-sm bg-void-800 border border-line px-3.5 py-2.5">
          <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        <div className="h-7 w-7 rounded-full bg-void-800 border border-line flex items-center justify-center shrink-0">
          <UserIcon size={13} className="text-white/50" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex gap-3"
    >
      <div className="h-7 w-7 rounded-sm border border-neon/30 bg-neon/5 flex items-center justify-center shrink-0">
        <span className="text-neon font-mono text-[11px] font-bold">C</span>
      </div>
      <div className="min-w-0 flex-1">
        {message.researchSteps && <ResearchStatus steps={message.researchSteps} />}
        {message.error ? (
          <ErrorState onRetry={onRegenerate} />
        ) : (
          <div className={cn('max-w-none', message.isStreaming && 'opacity-95')}>
            {renderMarkdown(message.content)}
            {message.isStreaming && <StreamingIndicator />}
          </div>
        )}
        {message.sources && <SourceList sources={message.sources} />}

        {!message.isStreaming && !message.error && (
          <div className="flex items-center gap-1 mt-2 -ml-1">
            <IconButton
              size="sm"
              icon={copied ? <Check size={13} /> : <Copy size={13} />}
              label="Copy response"
              onClick={handleCopy}
            />
            <IconButton size="sm" icon={<RotateCcw size={13} />} label="Regenerate response" onClick={onRegenerate} />
            <IconButton
              size="sm"
              active={feedback === 'up'}
              icon={<ThumbsUp size={13} />}
              label="Good response"
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
            />
            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              aria-label="Bad response"
              title="Bad response"
              className={cn(
                'h-7 w-7 flex items-center justify-center rounded-sm border transition-colors',
                feedback === 'down' ? 'text-warn bg-warn/10 border-warn/30' : 'text-white/45 border-transparent hover:text-warn hover:bg-void-800',
              )}
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}