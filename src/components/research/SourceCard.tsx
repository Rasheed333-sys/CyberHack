import { ExternalLink, Globe2 } from 'lucide-react';
import type { Source } from '@/types';

export function SourceCard({ source, index }: { source: Source; index: number }) {
  const publishedLabel = source.publishedAt
    ? new Date(source.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open source: ${source.title}`}
      className="group block rounded-sm border border-line bg-void-900/80 px-3.5 py-3 hover:border-neon/40 hover:bg-void-800/80 transition-all duration-200"
    >
      <div className="flex items-start gap-2.5">
        {/* Source number */}
        <span className="mono-label !text-neon/70 shrink-0 mt-0.5">
          [{index}]
        </span>

        <div className="min-w-0 flex-1">
          {/* Title */}
          <div className="flex items-start gap-2">
            <Globe2
              size={13}
              className="text-white/30 group-hover:text-neon shrink-0 mt-0.5 transition-colors"
            />

            <p className="text-[13px] font-medium text-white/85 leading-snug group-hover:text-neon transition-colors">
              {source.title}
            </p>
          </div>

          {/* Domain + published date */}
          <div className="flex items-center gap-2 mt-1.5 ml-5 min-w-0">
            <p className="mono-label !text-white/40 truncate">
              {source.domain}
            </p>

            {publishedLabel && (
              <>
                <span className="text-white/15">•</span>
                <p className="mono-label !text-white/30 shrink-0">
                  {publishedLabel}
                </p>
              </>
            )}
          </div>

          {/* Source snippet */}
          {source.snippet && (
            <p className="text-[11px] text-white/45 leading-relaxed mt-2 ml-5 line-clamp-2">
              {source.snippet}
            </p>
          )}
        </div>

        {/* Open source */}
        <div className="shrink-0 flex items-center gap-1 text-white/25 group-hover:text-neon transition-colors mt-0.5">
          <span className="hidden sm:inline mono-label !text-current">
            Open
          </span>
          <ExternalLink size={12} />
        </div>
      </div>
    </a>
  );
}

export default function SourceList({ sources }: { sources: Source[] }) {
  if (!sources?.length) return null;

  return (
    <section className="mt-4" aria-label="Sources">
      <div className="flex items-center justify-between mb-2">
        <p className="mono-label !text-white/40">
          Sources <span className="!text-neon/60">[{sources.length}]</span>
        </p>

        <span className="mono-label !text-white/20">
          WEB RESEARCH
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((source, index) => (
          <SourceCard
            key={source.id}
            source={source}
            index={index + 1}
          />
        ))}
      </div>
    </section>
  );
}