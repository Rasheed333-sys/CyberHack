import { browserModes } from '@/services/browser';
import type { BrowsingMode } from '@/types';
import { cn } from '@/utils/cn';

export default function BrowserModeSelector({
  value,
  onChange,
}: {
  value: BrowsingMode;
  onChange: (mode: BrowsingMode) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {browserModes.map((mode) => {
        const active = mode.id === value;
        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={cn(
              'text-left rounded-sm border p-4 transition-colors',
              active ? 'border-neon/50 bg-neon/5 shadow-neon' : 'border-line bg-void-900 hover:border-white/20',
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={cn('font-mono text-xs uppercase tracking-wider', active ? 'text-neon' : 'text-white/70')}>
                {mode.label}
              </span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulseRing" />}
            </div>
            <p className="text-xs text-white/40 leading-relaxed">{mode.description}</p>
          </button>
        );
      })}
    </div>
  );
}