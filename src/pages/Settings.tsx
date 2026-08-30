import { useState } from 'react';
import {
  SlidersHorizontal,
  Palette,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Search as SearchIcon,
  History as HistoryIcon,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { AppSettings } from '@/types';
import Toggle from '@/components/ui/Toggle';
import Panel from '@/components/ui/Panel';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/utils/cn';

const TABS = [
  { id: 'general', label: 'General', icon: SlidersHorizontal },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
  { id: 'security', label: 'Security', icon: ShieldAlert },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'search', label: 'Search', icon: SearchIcon },
  { id: 'history', label: 'History', icon: HistoryIcon },
] as const;

type TabId = (typeof TABS)[number]['id'];

function Row({ title, description, control }: { title: string; description: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm text-white/85">{title}</p>
        <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{description}</p>
      </div>
      {control}
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState<TabId>('general');
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const conversations = useAppStore((s) => s.conversations);
  const setConversations = useAppStore((s) => s.setConversations);
  const privacyState = useAppStore((s) => s.privacyState);

  const storageOptions: { value: AppSettings['conversationStorage']; label: string }[] = [
    { value: 'local', label: 'On this device' },
    { value: 'session-only', label: 'This session only' },
    { value: 'off', label: 'Off' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader eyebrow="Preferences" title="Settings" description="Configure CyberHack's behavior across the app." />

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto mt-6 mb-6 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono uppercase tracking-wide whitespace-nowrap border-b-2 -mb-px transition-colors',
                tab === t.id ? 'border-neon text-neon' : 'border-transparent text-white/40 hover:text-white/70',
              )}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'general' && (
          <div className="space-y-4">
            <Panel title="Conversation storage">
              <div className="p-4 flex flex-wrap gap-2">
                {storageOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ conversationStorage: opt.value })}
                    className={cn(
                      'rounded-sm border px-3 py-1.5 text-xs font-mono uppercase tracking-wide transition-colors',
                      settings.conversationStorage === opt.value
                        ? 'border-neon/40 text-neon bg-neon/5'
                        : 'border-line text-white/50 hover:text-white/80',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Panel>
            <Panel>
              <div className="divide-y divide-line">
                <Row
                  title="Browsing history"
                  description="Remember sites you've analyzed or visited through CyberHack."
                  control={<Toggle on={settings.browsingHistory} onClick={() => updateSettings({ browsingHistory: !settings.browsingHistory })} />}
                />
                <Row
                  title="Reduced motion"
                  description="Minimize animations and transitions across the interface."
                  control={<Toggle on={settings.reducedMotion} onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })} />}
                />
              </div>
            </Panel>
            <Panel title="Account">
              <p className="p-4 text-xs text-white/40 leading-relaxed">
                You're using CyberHack as a guest. Sign-in with email, OAuth, and passkeys is planned but not required —
                anonymous mode will always remain available.
              </p>
            </Panel>
          </div>
        )}

        {tab === 'appearance' && (
          <div className="space-y-4">
            <Panel title="Theme">
              <Row
                title="Dark (system)"
                description="CyberHack currently ships in a single dark, high-contrast theme built for privacy and focus."
                control={<StatusBadge status="active" size="sm" />}
              />
            </Panel>
            <Panel title="Accent color">
              <div className="p-4 flex items-center gap-3">
                <span className="h-8 w-8 rounded-sm bg-neon border border-neon/50" />
                <div>
                  <p className="text-sm text-white/85">Neon green</p>
                  <p className="text-xs text-white/40">CyberHack's signature accent. Custom accents are planned.</p>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {tab === 'privacy' && (
          <div className="space-y-4">
            <Panel title="Current mode">
              <Row
                title={privacyState.mode === 'standard' ? 'Standard' : privacyState.mode === 'private' ? 'Private' : 'High Privacy'}
                description="Manage full privacy controls, protection status, and mode selection in the Privacy Center."
                control={<StatusBadge status={privacyState.mode === 'standard' ? 'standby' : 'active'} size="sm" />}
              />
            </Panel>
            <p className="text-xs text-white/35">
              Open <span className="text-white/60">Privacy Center</span> from the sidebar for the full set of network, browser,
              and data controls.
            </p>
          </div>
        )}

        {tab === 'security' && (
          <Panel title="Security engine">
            <div className="divide-y divide-line">
              <Row title="Phishing protection" description="Flags sites impersonating known brands." control={<StatusBadge status="planned" size="sm" />} />
              <Row title="Malicious URL detection" description="Checks URLs against threat intelligence." control={<StatusBadge status="planned" size="sm" />} />
              <Row title="Download protection" description="Scans downloads for known threats." control={<StatusBadge status="planned" size="sm" />} />
            </div>
          </Panel>
        )}

        {tab === 'ai' && (
          <div className="space-y-4">
            <Panel title="AI engine">
              <Row
                title="Mock AI orchestrator"
                description="Responses are generated by a placeholder mock service for this development build."
                control={<StatusBadge status="active" label="MOCK" size="sm" />}
              />
            </Panel>
            <Panel title="Response behavior">
              <div className="divide-y divide-line">
                <Row title="Web search by default" description="Allow CyberHack to search the web for relevant chats." control={<Toggle on onClick={() => {}} disabled />} />
                <Row title="Show research steps" description="Display the searching / analyzing / synthesizing timeline." control={<Toggle on onClick={() => {}} disabled />} />
              </div>
            </Panel>
          </div>
        )}

        {tab === 'search' && (
          <Panel title="Search preferences">
            <div className="divide-y divide-line">
              <Row title="Default search mode" description="Web results are shown by default. News and Academic are available per-search." control={<StatusBadge status="active" label="WEB" size="sm" />} />
              <Row title="Safe results only" description="Filter search suggestions for a cleaner result set." control={<Toggle on onClick={() => {}} disabled />} />
            </div>
          </Panel>
        )}

        {tab === 'history' && (
          <div className="space-y-4">
            <Panel title="Conversation history">
              <Row
                title={`${conversations.length} conversation${conversations.length === 1 ? '' : 's'} stored`}
                description={settings.conversationStorage === 'off' ? 'History is currently disabled.' : 'Stored locally on this device only.'}
                control={
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (conversations.length === 0) return;
                      if (confirm('Delete all conversation history? This cannot be undone.')) setConversations([]);
                    }}
                  >
                    <Trash2 size={12} />
                    Clear all
                  </Button>
                }
              />
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}