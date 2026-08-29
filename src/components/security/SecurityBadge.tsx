import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { RiskLevel } from '@/types';
import { cn } from '@/utils/cn';

const CONFIG: Record<RiskLevel, { label: string; cls: string; Icon: typeof ShieldCheck }> = {
  low: { label: 'LOW RISK', cls: 'text-neon border-neon/40 bg-neon/5', Icon: ShieldCheck },
  medium: { label: 'MEDIUM RISK', cls: 'text-warn-amber border-warn-amber/40 bg-warn-amber/5', Icon: AlertTriangle },
  high: { label: 'HIGH RISK', cls: 'text-warn border-warn/40 bg-warn/5', Icon: ShieldAlert },
  unknown: { label: 'UNKNOWN', cls: 'text-white/40 border-line', Icon: ShieldAlert },
};

export default function SecurityBadge({ level }: { level: RiskLevel }) {
  const { label, cls, Icon } = CONFIG[level];
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider border rounded-sm px-2 py-1', cls)}>
      <Icon size={11} />
      {label}
    </span>
  );
}