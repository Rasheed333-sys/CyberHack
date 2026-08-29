import { Check, Loader2, Circle } from 'lucide-react';
import type { ResearchStep } from '@/types';
import { cn } from '@/utils/cn';

export default function ResearchStatus({ steps }: { steps: ResearchStep[] }) {
  if (!steps?.length) return null;
  return (
    <div className="my-2 space-y-1 border-l border-line pl-3">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-2 font-mono text-[11px]">
          {step.status === 'done' && <Check size={11} className="text-neon shrink-0" />}
          {step.status === 'active' && <Loader2 size={11} className="text-cyan shrink-0 animate-spin" />}
          {step.status === 'pending' && <Circle size={9} className="text-white/25 shrink-0" />}
          {step.status === 'error' && <Circle size={9} className="text-warn shrink-0" />}
          <span
            className={cn(
              'uppercase tracking-wider',
              step.status === 'done' && 'text-white/40',
              step.status === 'active' && 'text-cyan',
              step.status === 'pending' && 'text-white/25',
              step.status === 'error' && 'text-warn',
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}