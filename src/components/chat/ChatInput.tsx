import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Paperclip, Mic, Globe, ShieldCheck, Compass, Loader2 } from 'lucide-react';
import { searchService } from '@/services/search';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import type { SearchSuggestion } from '@/types';
import { cn } from '@/utils/cn';
import IconButton from '@/components/ui/IconButton';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function ChatInput({ onSubmit, loading, disabled, autoFocus }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [webSearchOn, setWebSearchOn] = useState(true);
  const [deepResearchOn, setDeepResearchOn] = useState(false);
  const [privacyModeOn, setPrivacyModeOn] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 220) + 'px';
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    searchService.suggest(value).then((res) => {
      if (active) setSuggestions(res);
    });
    return () => {
      active = false;
    };
  }, [value]);

  const handleSubmit = () => {
    const text = value.trim();
    if (!text || disabled || loading) return;
    onSubmit(text);
    setValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {showSuggestions && !value.trim() && (
        <SearchSuggestions
          suggestions={suggestions}
          onSelect={(label) => {
            setValue(label);
            setShowSuggestions(false);
            textareaRef.current?.focus();
          }}
        />
      )}

      <div
        className={cn(
          'relative rounded-sm border bg-void-900 transition-colors',
          disabled ? 'border-line opacity-60' : 'border-line focus-within:border-neon/50 focus-within:shadow-neon',
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          rows={1}
          placeholder="Ask CyberHack anything..."
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-sm text-white placeholder:text-white/30 focus:outline-none disabled:cursor-not-allowed"
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />

        <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1.5 flex-wrap gap-y-2">
          <div className="flex items-center gap-1 flex-wrap">
            <IconButton icon={<Paperclip size={14} />} label="Attach a file (coming soon)" disabled size="sm" />
            <IconButton icon={<Mic size={14} />} label="Voice input (coming soon)" disabled size="sm" />
            <div className="w-px h-4 bg-line mx-1 hidden sm:block" />
            <button
              type="button"
              onClick={() => setWebSearchOn((v) => !v)}
              title="Toggle web search"
              className={cn(
                'h-7 flex items-center gap-1.5 px-2 rounded-sm text-[11px] font-mono uppercase tracking-wide transition-colors',
                webSearchOn ? 'text-cyan bg-cyan/10 border border-cyan/30' : 'text-white/35 border border-transparent hover:text-white/60',
              )}
            >
              <Globe size={12} />
              <span className="hidden sm:inline">Search Web</span>
            </button>
            <button
              type="button"
              onClick={() => setDeepResearchOn((v) => !v)}
              title="Toggle deep research mode"
              className={cn(
                'h-7 flex items-center gap-1.5 px-2 rounded-sm text-[11px] font-mono uppercase tracking-wide transition-colors',
                deepResearchOn ? 'text-cyan bg-cyan/10 border border-cyan/30' : 'text-white/35 border border-transparent hover:text-white/60',
              )}
            >
              <Compass size={12} />
              <span className="hidden sm:inline">Deep Research</span>
            </button>
            <button
              type="button"
              onClick={() => setPrivacyModeOn((v) => !v)}
              title="Toggle privacy-routed browsing"
              className={cn(
                'h-7 flex items-center gap-1.5 px-2 rounded-sm text-[11px] font-mono uppercase tracking-wide transition-colors',
                privacyModeOn ? 'text-neon bg-neon/10 border border-neon/30' : 'text-white/35 border border-transparent hover:text-white/60',
              )}
            >
              <ShieldCheck size={12} />
              <span className="hidden sm:inline">Privacy Mode</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline mono-label !text-white/25">⏎ send · ⇧⏎ newline</span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim() || disabled || loading}
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded-sm transition-colors',
                value.trim() && !disabled && !loading
                  ? 'bg-neon text-void-950 hover:bg-neon/90'
                  : 'bg-void-800 text-white/25 cursor-not-allowed',
              )}
              aria-label="Send"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}