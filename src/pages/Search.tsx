import { useState } from 'react';
import { Search as SearchIcon, Loader2, Globe, Newspaper, GraduationCap } from 'lucide-react';
import { searchService } from '@/services/search';
import SearchResultCard from '@/components/search/SearchResultCard';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import CyclingStatus from '@/components/ui/CyclingStatus';
import { cn } from '@/utils/cn';
import type { SearchResult } from '@/types';

const MODES = [
  { id: 'web', label: 'Web', icon: Globe },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
] as const;

type Mode = (typeof MODES)[number]['id'];

export default function Search() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('web');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(false);
    setLastQuery(q);
    try {
      const res = await searchService.search(q);
      setResults(res);
    } catch {
      setError(true);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <SectionHeader
          eyebrow="Web search"
          title="Search the open web"
          description="Query the web through CyberHack. Results below are demo data until a live search backend is connected."
          icon={<SearchIcon size={16} className="text-cyan" />}
        />

        <div className="flex items-center gap-2 rounded-sm border border-line bg-void-900 px-3 py-2 focus-within:border-neon/40 transition-colors">
          <SearchIcon size={14} className="text-white/30 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
            placeholder="Search anything..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          <button
            onClick={() => runSearch(query)}
            disabled={!query.trim() || loading}
            className="shrink-0 rounded-sm bg-neon text-void-950 text-xs font-mono uppercase tracking-wide px-3 py-1.5 disabled:bg-void-800 disabled:text-white/25 hover:bg-neon/90 transition-colors"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[11px] font-mono uppercase tracking-wide transition-colors',
                mode === m.id ? 'border-neon/35 text-neon bg-neon/5' : 'border-line text-white/40 hover:text-white/70',
              )}
            >
              <m.icon size={11} />
              {m.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-6">
            <CyclingStatus labels={['Searching web', 'Collecting sources', 'Ranking results']} />
          </div>
        )}

        {error && <ErrorState message="CyberHack couldn't complete this search." onRetry={() => runSearch(lastQuery)} />}

        {!loading && !error && results && results.length > 0 && (
          <div className="space-y-2.5">
            <p className="mono-label !text-white/30">{results.length} results · {mode}</p>
            {results.map((r, i) => (
              <SearchResultCard key={r.id} result={r} index={i + 1} />
            ))}
          </div>
        )}

        {!loading && !error && results && results.length === 0 && (
          <EmptyState
            icon={<SearchIcon size={16} />}
            title="No results"
            description={`Nothing found for "${lastQuery}". Try a different query.`}
          />
        )}

        {!loading && !error && results === null && (
          <EmptyState
            icon={<SearchIcon size={16} />}
            title="Search the web privately"
            description="Results, sources, and security indicators will appear here once you run a query."
          />
        )}
      </div>
    </div>
  );
}