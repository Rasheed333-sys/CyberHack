import { ExternalLink } from 'lucide-react';
import type { Source } from '@/types';

export function SourceCard({ source, index }: { source: Source; index: number }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-sm border border-line bg-void-900 px-3 py-2.5 hover:border-neon/30 transition-colors"
    >
      <div className="flex items-start gap-2">
        <span className="mono-label !text-neon/70 shrink-0 mt-0.5">[{index}]</span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-white/85 leading-snug truncate group-hover:text-neon transition-colors">
            {source.title}
          </p>
          <p className="mono-label !text-white/35 mt-1 truncate">{source.domain}</p>
        </div>
        <ExternalLink size={12} className="text-white/25 group-hover:text-neon shrink-0 mt-1 transition-colors" />
      </div>
    </a>
  );
}

export default function SourceList({ sources }: { sources: Source[] }) {
  if (!sources?.length) return null;
  return (
    <div className="mt-3">
      <p className="mono-label !text-white/40 mb-2">Sources ({sources.length})</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((s, i) => (
          <SourceCard key={s.id} source={s} index={i + 1} />
        ))}
      </div>
    </div>
  );
}