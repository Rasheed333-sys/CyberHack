import { ShieldCheck, Radio, Cookie, EyeOff, Fingerprint, Server, Lock, ShieldAlert, Database } from 'lucide-react';
import PrivacyPanel, { type PrivacyItem } from '@/components/privacy/PrivacyPanel';
import PrivacyControlRow, { type ControlRowData } from '@/components/privacy/PrivacyControlRow';
import BrowserModeSelector from '@/components/browser/BrowserModeSelector';
import SectionHeader from '@/components/ui/SectionHeader';
import Panel from '@/components/ui/Panel';
import { useAppStore } from '@/store/useAppStore';

export default function Privacy() {
  const privacyState = useAppStore((s) => s.privacyState);
  const setBrowsingMode = useAppStore((s) => s.setBrowsingMode);
  const settings = useAppStore((s) => s.settings);

  const derivedNote = privacyState.mode === 'standard' ? 'Enable Private or High Privacy mode to activate' : 'Controlled by Privacy Mode';

  const coreControls: ControlRowData[] = [
    {
      icon: <Radio size={14} />,
      title: 'Tracker Protection',
      description: 'Blocks known third-party trackers, ad pixels, and analytics beacons.',
      status: privacyState.trackerBlocking ? 'active' : ('inactive' as const),
      note: derivedNote,
    },
    {
      icon: <Cookie size={14} />,
      title: 'Cookie Isolation',
      description: 'Keeps cookies scoped per session so sites cannot correlate you across visits.',
      status: privacyState.cookieIsolation ? 'active' : ('inactive' as const),
      note: derivedNote,
    },
    {
      icon: <EyeOff size={14} />,
      title: 'Referrer Protection',
      description: 'Strips or trims the Referer header sent to destination sites.',
      status: privacyState.referrerControl ? 'active' : ('inactive' as const),
      note: derivedNote,
    },
    {
      icon: <Fingerprint size={14} />,
      title: 'Fingerprint Protection',
      description: 'Reduces the uniqueness of signals used for browser fingerprinting.',
      status: privacyState.fingerprintResistance ? 'active' : ('planned' as const),
      note: privacyState.mode === 'high-privacy' ? 'Controlled by Privacy Mode' : 'Available in High Privacy mode',
    },
    {
      icon: <Server size={14} />,
      title: 'DNS Protection',
      description: 'Encrypts DNS lookups so your ISP or network cannot see plaintext domain queries.',
      status: 'planned' as const,
      note: 'Backend not connected yet',
    },
    {
      icon: <Lock size={14} />,
      title: 'IP Protection',
      description: 'Routes browsing traffic to reduce direct IP exposure to destination sites.',
      status: privacyState.ipProtection ? 'active' : ('inactive' as const),
      note: derivedNote,
    },
  ];

  const securityItems: PrivacyItem[] = [
    { label: 'Phishing protection', description: 'Flags sites that impersonate known brands or use deceptive patterns.', status: 'planned' },
    { label: 'Malicious URL detection', description: 'Checks URLs against threat intelligence before you open them.', status: 'planned' },
    { label: 'Suspicious script detection', description: 'Flags obfuscated or unusually invasive scripts on a page.', status: 'planned' },
    { label: 'Download protection', description: 'Scans downloaded files for known threats before they reach your device.', status: 'planned' },
  ];

  const dataItems: PrivacyItem[] = [
    {
      label: 'Conversation storage',
      description: 'Where your chat history is kept.',
      status: settings.conversationStorage === 'off' ? 'inactive' : 'active',
    },
    {
      label: 'Browsing history',
      description: 'Whether visited sites are recorded locally.',
      status: settings.browsingHistory ? 'active' : 'inactive',
    },
    { label: 'Local storage', description: 'App data stored on this device only, never synced without consent.', status: 'active' },
    { label: 'Telemetry', description: 'Anonymous usage analytics. Off by default.', status: settings.telemetry ? 'active' : 'inactive' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <SectionHeader
          eyebrow="Privacy center"
          title="Your privacy console"
          description={'CyberHack reduces what sites and networks can observe about you. It does not — and cannot honestly claim to — guarantee absolute anonymity. Items marked "planned" are not active yet.'}
          icon={<ShieldCheck size={16} className="text-neon" />}
        />

        <section>
          <p className="mono-label !text-white/40 mb-3">Privacy mode</p>
          <BrowserModeSelector value={privacyState.mode} onChange={setBrowsingMode} />
        </section>

        <Panel title="Network & browser protection" icon={<ShieldCheck size={13} className="text-white/50" />}>
          <div className="divide-y divide-line">
            {coreControls.map((c) => (
              <PrivacyControlRow key={c.title} {...c} />
            ))}
          </div>
        </Panel>

        <PrivacyPanel title="Security" icon={<ShieldAlert size={13} className="text-white/50" />} items={securityItems} />
        <PrivacyPanel title="Data" icon={<Database size={13} className="text-white/50" />} items={dataItems} />
      </div>
    </div>
  );
}