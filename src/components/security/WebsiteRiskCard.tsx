import { Lock, Unlock, FlaskConical } from 'lucide-react';
import type { WebsiteRiskAnalysis } from '@/types';
import SecurityBadge from './SecurityBadge';
import PrivacyScore from '@/components/privacy/PrivacyScore';
import { cn } from '@/utils/cn';

interface WebsiteRiskCardProps {
  analysis: WebsiteRiskAnalysis;
  onOpenPrivately?: () => void;
  onOpenNormally?: () => void;
}

export default function WebsiteRiskCard({ analysis, onOpenPrivately, onOpenNormally }: WebsiteRiskCardProps) {
  return (
    <div className="surface rounded-sm overflow-hidden">
      {analysis.isMockData && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan/10 border-b border-cyan/25 text-cyan">
          <FlaskConical size={11} />
          <span className="font-mono text-[10px] uppercase tracking-wider">Demo data — not a real analysis</span>
        </div>
      )}

      <div className="p-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="mono-label !text-white/40">Website</p>
          <p className="text-white font-mono text-sm mt-0.5">{analysis.domain}</p>
        </div>
        <PrivacyScore score={analysis.privacyScore} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border-y border-line">
        <Metric
          label="IP exposure"
          value={analysis.ipExposure === 'protected' ? 'Protected' : 'Exposed'}
          icon={analysis.ipExposure === 'protected' ? <Lock size={13} className="text-neon" /> : <Unlock size={13} className="text-warn" />}
        />
        <Metric label="Trackers blocked" value={String(analysis.trackersBlocked)} />
        <Metric label="3rd-party requests" value={String(analysis.thirdPartyRequests)} />
        <Metric label="Cookies isolated" value={String(analysis.cookiesIsolated)} />
      </div>

      <div className="p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="mono-label !text-white/40">Fingerprint risk</span>
          <SecurityBadge level={analysis.fingerprintRisk} />
        </div>
        <div className="flex items-center gap-2">
          <span className="mono-label !text-white/40">Security</span>
          <SecurityBadge level={analysis.securityRisk} />
        </div>
      </div>

      <div className="p-4 pt-0 flex gap-2">
        <button
          onClick={onOpenPrivately}
          className="flex-1 rounded-sm bg-neon text-void-950 text-xs font-mono uppercase tracking-wide py-2 hover:bg-neon/90 transition-colors"
        >
          Open Privately
        </button>
        <button
          onClick={onOpenNormally}
          className="flex-1 rounded-sm border border-line text-white/60 text-xs font-mono uppercase tracking-wide py-2 hover:text-white hover:border-white/30 transition-colors"
        >
          Open Normally
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className={cn('bg-void-900 px-3 py-3')}>
      <p className="mono-label !text-white/35">{label}</p>
      <div className="flex items-center gap-1.5 mt-1">
        {icon}
        <p className="text-sm text-white/90 font-mono">{value}</p>
      </div>
    </div>
  );
}