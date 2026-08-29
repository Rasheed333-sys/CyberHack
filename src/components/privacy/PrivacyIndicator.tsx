import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/utils/cn';

export default function PrivacyIndicator() {
  const [open, setOpen] = useState(false);
  const privacyState = useAppStore((s) => s.privacyState);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const active = privacyState.mode !== 'standard';

  const rows: { label: string; on: boolean }[] = [
    { label: 'IP protection', on: privacyState.ipProtection },
    { label: 'Tracker blocking', on: privacyState.trackerBlocking },
    { label: 'Referrer control', on: privacyState.referrerControl },
    { label: 'Cookie isolation', on: privacyState.cookieIsolation },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs font-mono transition-colors',
          active ? 'border-neon/40 text-neon bg-neon/5' : 'border-line text-white/50 hover:text-white/80',
        )}
      >
        <ShieldCheck size={13} />
        <span className="hidden sm:inline uppercase tracking-[0.08em]">
          {active ? privacyState.mode.replace('-', ' ') : 'standard'}
        </span>
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 surface-raised rounded-sm shadow-neon z-30 overflow-hidden">
          <div className="px-3 py-2 border-b border-line flex items-center gap-2">
            <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-neon animate-pulseRing' : 'bg-white/30')} />
            <span className="mono-label !text-white/70">
              {active ? `${privacyState.mode.replace('-', ' ')} mode` : 'standard mode'}
            </span>
          </div>
          <div className="p-3 space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{r.label}</span>
                <span className={cn('font-mono text-[10px] uppercase tracking-wider', r.on ? 'text-neon' : 'text-white/30')}>
                  {r.on ? 'active' : 'off'}
                </span>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-line">
            <p className="text-[11px] text-white/35 leading-relaxed">
              CyberHack reduces exposure — it cannot guarantee absolute anonymity. See Privacy Center for details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}