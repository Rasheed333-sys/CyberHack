import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface PrivacyItem {
  label: string;
  description: string;
  status: 'active' | 'inactive' | 'planned';
  configurable?: boolean;
}

function StatusBadge({ status }: { status: PrivacyItem['status'] }) {
  const map = {
    active: { text: 'ACTIVE', cls: 'text-neon border-neon/40 bg-neon/5' },
    inactive: { text: 'INACTIVE', cls: 'text-white/40 border-line' },
    planned: { text: 'PLANNED', cls: 'text-cyan border-cyan/40 bg-cyan/5' },
  } as const;
  const s = map[status];
  return (
    <span className={cn('font-mono text-[10px] uppercase tracking-wider border rounded-sm px-1.5 py-0.5', s.cls)}>
      {s.text}
    </span>
  );
}

export default function PrivacyPanel({ title, icon, items }: { title: string; icon?: ReactNode; items: PrivacyItem[] }) {
  return (
    <section className="surface rounded-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
        {icon}
        <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-white/70">{title}</h3>
      </div>
      <div className="divide-y divide-line">
        {items.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm text-white/85">{item.label}</p>
              <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{item.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}