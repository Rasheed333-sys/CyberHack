import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function BrowserControls({
  onAnalyze,
  loading,
}: {
  onAnalyze: (domain: string) => void;
  loading?: boolean;
}) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const domain = trimmed.replace(/^https?:\/\//, '').split('/')[0];
    onAnalyze(domain);
  };

  return (
    <div className="flex items-center gap-2 rounded-sm border border-line bg-void-900 px-3 py-2 focus-within:border-neon/40">
      <Search size={14} className="text-white/30 shrink-0" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Enter a URL or domain to analyze — e.g. example.com"
        className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={loading || !value.trim()}
        className="shrink-0 rounded-sm bg-neon text-void-950 text-xs font-mono uppercase tracking-wide px-3 py-1.5 disabled:bg-void-800 disabled:text-white/25 hover:bg-neon/90 transition-colors"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : 'Analyze'}
      </button>
    </div>
  );
}