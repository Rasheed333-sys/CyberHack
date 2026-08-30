import { Lock, ShieldCheck, Cookie, EyeOff, Radio, FlaskConical } from 'lucide-react';
import type { WebsiteRiskAnalysis, PrivacyState } from '@/types';
import StatusBadge, { type Status } from '@/components/ui/StatusBadge';

interface Row {
  icon: typeof Lock;
  label: string;
  value: string;
  status: Status;
}

export default function ConnectionPanel({
  analysis,
  privacyState,
}: {
  analysis: WebsiteRiskAnalysis;
  privacyState: PrivacyState;
}) {
  const rows: Row[] = [
    {
      icon: Lock,
      label: 'Connection',
      value: analysis.securityRisk === 'low' ? 'Secure' : analysis.securityRisk === 'medium' ? 'Caution' : 'At risk',
      status: analysis.securityRisk === 'low' ? 'active' : analysis.securityRisk === 'medium' ? 'warning' : 'error',
    },
    {
      icon: ShieldCheck,
      label: 'Trackers',
      value: `${analysis.trackersBlocked} blocked`,
      status: 'active',
    },
    {
      icon: Radio,
      label: 'Third-party requests',
      value: String(analysis.thirdPartyRequests),
      status: analysis.thirdPartyRequests > 8 ? 'warning' : 'standby',
    },
    {
      icon: Cookie,
      label: 'Cookies',
      value: `${analysis.cookiesIsolated} isolated`,
      status: 'active',
    },
    {
      icon: EyeOff,
      label: 'Referrer',
      value: privacyState.referrerControl ? 'Protected' : 'Standard',
      status: privacyState.referrerControl ? 'active' : 'inactive',
    },
    {
      icon: Lock,
      label: 'IP protection',
      value: privacyState.ipProtection ? 'Ready' : 'Standby',
      status: privacyState.ipProtection ? 'active' : 'standby',
    },
  ];

  return (
    <div className="rounded-sm border border-line bg-void-900/60 overflow-hidden">
      {analysis.isMockData && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan/10 border-b border-cyan/25 text-cyan">
          <FlaskConical size={11} />
          <span className="font-mono text-[10px] uppercase tracking-wider">Demo data — not a real analysis</span>
        </div>
      )}
      <div className="divide-y divide-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <row.icon size={14} className="text-white/35 shrink-0" />
              <div className="min-w-0">
                <p className="mono-label !text-white/35">{row.label}</p>
                <p className="text-sm text-white/85 mt-0.5">{row.value}</p>
              </div>
            </div>
            <StatusBadge status={row.status} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}