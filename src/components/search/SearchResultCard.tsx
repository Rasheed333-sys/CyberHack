import { Lock, Unlock, FlaskConical, ExternalLink } from 'lucide-react';
import type { SearchResult } from '@/types';

export default function SearchResultCard({ result, index }: { result: SearchResult; index: number }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-sm border border-line bg-void-900/60 px-4 py-3.5 hover:border-neon/25 hover:bg-void-900 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="mono-label !text-white/25 shrink-0 mt-0.5 w-4">{index}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="mono-label !text-white/35 truncate">{result.domain}</p>
            {result.secure ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neon/70">
                <Lock size={10} /> secure
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-warn/70">
                <Unlock size={10} /> insecure
              </span>
            )}
            {result.isMockData && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan/70">
                <FlaskConical size={10} /> demo
              </span>
            )}
          </div>
          <p className="text-sm text-white/90 mt-1 group-hover:text-neon transition-colors">{result.title}</p>
          <p className="text-xs text-white/40 mt-1 leading-relaxed line-clamp-2">{result.description}</p>
        </div>
        <ExternalLink size={13} className="text-white/20 group-hover:text-neon shrink-0 mt-1 transition-colors" />
      </div>
    </a>
  );
}