import { useState } from 'react';
import { Globe } from 'lucide-react';
import BrowserModeSelector from '@/components/browser/BrowserModeSelector';
import BrowserControls from '@/components/browser/BrowserControls';
import WebsiteRiskCard from '@/components/security/WebsiteRiskCard';
import { securityService } from '@/services/security';
import { useAppStore } from '@/store/useAppStore';
import type { WebsiteRiskAnalysis } from '@/types';

export default function SecureBrowse() {
  const privacyState = useAppStore((s) => s.privacyState);
  const setBrowsingMode = useAppStore((s) => s.setBrowsingMode);
  const [analysis, setAnalysis] = useState<WebsiteRiskAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (domain: string) => {
    setLoading(true);
    setAnalysis(null);
    const result = await securityService.analyze(domain);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe size={16} className="text-neon" />
            <h2 className="font-mono text-sm uppercase tracking-[0.12em] text-white/70">Secure Browse</h2>
          </div>
          <p className="text-xs text-white/40 max-w-lg leading-relaxed">
            Choose a browsing mode and analyze a site before opening it. Isolated sessions and relay routing are
            planned — the frontend architecture below is ready for that backend to connect.
          </p>
        </div>

        <section>
          <p className="mono-label !text-white/40 mb-3">Browsing mode</p>
          <BrowserModeSelector value={privacyState.mode} onChange={setBrowsingMode} />
        </section>

        <section>
          <p className="mono-label !text-white/40 mb-3">Website analysis</p>
          <BrowserControls onAnalyze={handleAnalyze} loading={loading} />
          {analysis && (
            <div className="mt-4">
              <WebsiteRiskCard
                analysis={analysis}
                onOpenPrivately={() => alert('Isolated private browsing is not implemented yet — this is a UI placeholder.')}
                onOpenNormally={() => alert('Direct browsing is not implemented yet — this is a UI placeholder.')}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}