import { Network, Cookie, ShieldAlert, Database } from 'lucide-react';
import PrivacyPanel, { type PrivacyItem } from '@/components/privacy/PrivacyPanel';
import { useAppStore } from '@/store/useAppStore';

export default function Privacy() {
  const privacyState = useAppStore((s) => s.privacyState);
  const settings = useAppStore((s) => s.settings);

  const networkItems: PrivacyItem[] = [
    {
      label: 'IP protection',
      description: 'Routes browsing traffic to reduce direct IP exposure to destination sites.',
      status: privacyState.ipProtection ? 'active' : 'inactive',
    },
    {
      label: 'DNS protection',
      description: 'Encrypts DNS lookups so your ISP or network cannot see plaintext domain queries.',
      status: 'planned',
    },
    {
      label: 'Encrypted connection',
      description: 'All traffic between the app and CyberHack services uses TLS in transit.',
      status: 'active',
    },
    {
      label: 'Relay status',
      description: 'Connection to the privacy relay network used in Private and High Privacy modes.',
      status: privacyState.relayStatus === 'connected' ? 'active' : 'planned',
    },
  ];

  const browserItems: PrivacyItem[] = [
    {
      label: 'Tracker blocking',
      description: 'Blocks known third-party trackers, ad pixels, and analytics beacons.',
      status: privacyState.trackerBlocking ? 'active' : 'inactive',
    },
    {
      label: 'Cookie isolation',
      description: 'Keeps cookies scoped per session so sites cannot correlate you across visits.',
      status: privacyState.cookieIsolation ? 'active' : 'inactive',
    },
    {
      label: 'Storage isolation',
      description: 'Isolates localStorage/IndexedDB per browsing session.',
      status: 'planned',
    },
    {
      label: 'Referrer protection',
      description: 'Strips or trims the Referer header sent to destination sites.',
      status: privacyState.referrerControl ? 'active' : 'inactive',
    },
    {
      label: 'Fingerprint protection',
      description: 'Reduces the uniqueness of signals used for browser fingerprinting.',
      status: privacyState.fingerprintResistance ? 'active' : 'planned',
    },
  ];

  const securityItems: PrivacyItem[] = [
    {
      label: 'Phishing protection',
      description: 'Flags sites that impersonate known brands or use deceptive patterns.',
      status: 'planned',
    },
    {
      label: 'Malicious URL detection',
      description: 'Checks URLs against threat intelligence before you open them.',
      status: 'planned',
    },
    {
      label: 'Suspicious script detection',
      description: 'Flags obfuscated or unusually invasive scripts on a page.',
      status: 'planned',
    },
    {
      label: 'Download protection',
      description: 'Scans downloaded files for known threats before they reach your device.',
      status: 'planned',
    },
  ];

  const dataItems: PrivacyItem[] = [
    {
      label: 'Conversation storage',
      description: 'Where your chat history is kept.',
      status: settings.conversationStorage === 'off' ? 'inactive' : 'active',
      configurable: true,
    },
    {
      label: 'Browsing history',
      description: 'Whether visited sites are recorded locally.',
      status: settings.browsingHistory ? 'active' : 'inactive',
      configurable: true,
    },
    {
      label: 'Local storage',
      description: 'App data stored on this device only, never synced without consent.',
      status: 'active',
    },
    {
      label: 'Telemetry',
      description: 'Anonymous usage analytics. Off by default.',
      status: settings.telemetry ? 'active' : 'inactive',
      configurable: true,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-[0.12em] text-white/70">Privacy Center</h2>
          <p className="text-xs text-white/40 mt-1 max-w-lg leading-relaxed">
            CyberHack reduces what sites and networks can observe about you. It does not — and cannot honestly claim
            to — guarantee absolute anonymity. Items marked "planned" are not active yet.
          </p>
        </div>

        <PrivacyPanel title="Network Privacy" icon={<Network size={13} className="text-white/50" />} items={networkItems} />
        <PrivacyPanel title="Browser Privacy" icon={<Cookie size={13} className="text-white/50" />} items={browserItems} />
        <PrivacyPanel title="Security" icon={<ShieldAlert size={13} className="text-white/50" />} items={securityItems} />
        <PrivacyPanel title="Data" icon={<Database size={13} className="text-white/50" />} items={dataItems} />
      </div>
    </div>
  );
}