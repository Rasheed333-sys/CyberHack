import { History, Sparkles, Zap } from 'lucide-react';
import type { SearchSuggestion } from '@/types';

const ICONS = {
  history: History,
  suggestion: Sparkles,
  action: Zap,
};

export default function SearchSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: SearchSuggestion[];
  onSelect: (label: string) => void;
}) {
  if (!suggestions.length) return null;
  return (
    <div className="absolute left-0 right-0 top-full mt-2 surface-raised rounded-sm shadow-neon overflow-hidden z-30">
      {suggestions.map((s) => {
        const Icon = ICONS[s.kind];
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.label)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-white/70 hover:bg-void-700 hover:text-white transition-colors border-b border-line last:border-b-0"
          >
            <Icon size={13} className="text-white/30 shrink-0" />
            <span className="truncate">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}