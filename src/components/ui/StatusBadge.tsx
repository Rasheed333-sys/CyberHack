import { cn } from '@/utils/cn';

export type Status = 'active' | 'inactive' | 'planned' | 'warning' | 'error' | 'standby';

const CONFIG: Record<Status, { label: string; cls: string; dot: string }> = {
  active: { label: 'ACTIVE', cls: 'text-neon border-neon/35 bg-neon/5', dot: 'bg-neon' },
  inactive: { label: 'INACTIVE', cls: 'text-white/40 border-line', dot: 'bg-white/25' },
  planned: { label: 'PLANNED', cls: 'text-cyan border-cyan/35 bg-cyan/5', dot: 'bg-cyan' },
  warning: { label: 'WARNING', cls: 'text-warn-amber border-warn-amber/35 bg-warn-amber/5', dot: 'bg-warn-amber' },
  error: { label: 'ERROR', cls: 'text-warn border-warn/35 bg-warn/5', dot: 'bg-warn' },
  standby: { label: 'STANDBY', cls: 'text-white/45 border-line', dot: 'bg-white/30' },
};

export default function StatusBadge({
  status,
  label,
  pulse = false,
  size = 'md',
}: {
  status: Status;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
}) {
  const c = CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border font-mono uppercase tracking-wider',
        c.cls,
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot, pulse && status === 'active' && 'animate-pulseRing')} />
      {label ?? c.label}
    </span>
  );
}