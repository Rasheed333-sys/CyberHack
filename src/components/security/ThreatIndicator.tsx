import { ShieldAlert } from 'lucide-react';

export default function ThreatIndicator({ count }: { count: number }) {
  if (count <= 0) {
    return <span className="mono-label !text-neon/70">No threats detected</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-warn font-mono text-[11px] uppercase tracking-wide">
      <ShieldAlert size={12} />
      {count} potential {count === 1 ? 'threat' : 'threats'} flagged
    </span>
  );
}