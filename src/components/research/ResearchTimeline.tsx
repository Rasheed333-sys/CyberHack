import { Check, Loader2, Circle, AlertTriangle } from 'lucide-react';
import type { ResearchStep } from '@/types';
import { cn } from '@/utils/cn';

export default function ResearchTimeline({ steps }: { steps: ResearchStep[] }) {
  if (!steps?.length) return null;
  return (
    <div className="relative pl-1">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  'absolute left-[9px] top-5 bottom-0 w-px',
                  step.status === 'done' ? 'bg-neon/25' : 'bg-line',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 mt-0.5 h-[19px] w-[19px] shrink-0 rounded-full border flex items-center justify-center',
                step.status === 'done' && 'border-neon/40 bg-neon/10',
                step.status === 'active' && 'border-cyan/50 bg-cyan/10',
                step.status === 'pending' && 'border-line bg-void-900',
                step.status === 'error' && 'border-warn/50 bg-warn/10',
              )}
            >
              {step.status === 'done' && <Check size={11} className="text-neon" />}
              {step.status === 'active' && <Loader2 size={11} className="text-cyan animate-spin" />}
              {step.status === 'pending' && <Circle size={7} className="text-white/20" />}
              {step.status === 'error' && <AlertTriangle size={11} className="text-warn" />}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  'text-sm',
                  step.status === 'done' && 'text-white/55',
                  step.status === 'active' && 'text-white',
                  step.status === 'pending' && 'text-white/30',
                  step.status === 'error' && 'text-warn',
                )}
              >
                {step.label}
              </p>
              {step.detail && <p className="text-xs text-white/30 mt-0.5">{step.detail}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}