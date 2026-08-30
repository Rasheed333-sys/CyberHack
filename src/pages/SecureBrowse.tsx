import { useState } from 'react';
import { Globe, MonitorX, FlaskConical } from 'lucide-react';
import BrowserModeSelector from '@/components/browser/BrowserModeSelector';
import BrowserControls from '@/components/browser/BrowserControls';
import WebsiteRiskCard from '@/components/security/WebsiteRiskCard';
import ConnectionPanel from '@/components/security/ConnectionPanel';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import CyclingStatus from '@/components/ui/CyclingStatus';
import { securityService } from '@/services/security';
import { useAppStore } from '@/store/useAppStore';
import type { WebsiteRiskAnalysis } from '@/types';

export default function SecureBrowse() {
  const privacyState = useAppStore((s) => s.privacyState);
  const setBrowsingMode = useAppStore((s) => s.setBrowsingMode);
  const [domain, setDomain] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<WebsiteRiskAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (d: string) => {
    setLoading(true);
    setAnalysis(null);
    setDomain(d);
    const result = await securityService.analyze(d);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <SectionHeader
          eyebrow="Secure browse"
          title="Browse with privacy engineered in"
          description="Choose a browsing mode and inspect a site before opening it. Isolated sessions and relay routing are planned — this UI is the architecture they'll connect to."
          icon={<Globe size={16} className="text-neon" />}
        />

        <section>
          <p className="mono-label !text-white/40 mb-3">Browsing mode</p>
          <BrowserModeSelector value={privacyState.mode} onChange={setBrowsingMode} />
        </section>

        <section className="space-y-3">
          <p className="mono-label !text-white/40">Analyze a website</p>
          <BrowserControls onAnalyze={handleAnalyze} loading={loading} />

          {/* Browser-like content preview */}
          <div className="rounded-sm border border-line bg-void-925 overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-line bg-void-900">
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="ml-2 flex-1 truncate rounded-sm bg-void-800 px-2.5 py-1 font-mono text-[11px] text-white/35">
                {domain ?? 'about:blank'}
              </span>
            </div>
            <div className="h-40 flex items-center justify-center">
              {loading ? (
                <CyclingStatus labels={['Establishing session', 'Checking connection']} />
              ) : domain ? (
                <EmptyState
                  icon={<MonitorX size={16} />}
                  title="Live preview not available yet"
                  description="Isolated browser rendering is a planned feature — this pane will show the page once the Browser Engine is connected."
                />
              ) : (
                <EmptyState icon={<Globe size={16} />} title="No site loaded" description="Enter a URL above to inspect it." />
              )}
            </div>
          </div>

          {analysis && (
            <div className="space-y-3 pt-1">
              <WebsiteRiskCard
                analysis={analysis}
                onOpenPrivately={() => alert('Isolated private browsing is not implemented yet — this is a UI placeholder.')}
                onOpenNormally={() => alert('Direct browsing is not implemented yet — this is a UI placeholder.')}
              />
              <ConnectionPanel analysis={analysis} privacyState={privacyState} />
            </div>
          )}
        </section>

        {!analysis && !loading && domain === null && (
          <div className="flex items-center gap-1.5 text-white/25 font-mono text-[10px] uppercase tracking-wider">
            <FlaskConical size={11} />
            All analysis on this page uses demo data until a security backend is connected
          </div>
        )}
      </div>
    </div>
  );
}