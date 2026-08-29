import { useAppStore } from '@/store/useAppStore';
import type { AppSettings } from '@/types';
import { cn } from '@/utils/cn';

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors shrink-0',
        on ? 'bg-neon/80' : 'bg-void-700',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-void-950 transition-transform',
          on ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

export default function Settings() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const storageOptions: { value: AppSettings['conversationStorage']; label: string }[] = [
    { value: 'local', label: 'On this device' },
    { value: 'session-only', label: 'This session only' },
    { value: 'off', label: 'Off' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <h2 className="font-mono text-sm uppercase tracking-[0.12em] text-white/70">Settings</h2>

        <section className="surface rounded-sm">
          <div className="px-4 py-3 border-b border-line">
            <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-white/70">Conversation storage</h3>
          </div>
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
        </section>

        <section className="surface rounded-sm divide-y divide-line">
          <Row
            title="Browsing history"
            description="Remember sites you've analyzed or visited through CyberHack."
            on={settings.browsingHistory}
            onClick={() => updateSettings({ browsingHistory: !settings.browsingHistory })}
          />
          <Row
            title="Telemetry"
            description="Share anonymous usage analytics to help improve CyberHack. Off by default."
            on={settings.telemetry}
            onClick={() => updateSettings({ telemetry: !settings.telemetry })}
          />
          <Row
            title="Reduced motion"
            description="Minimize animations and transitions across the interface."
            on={settings.reducedMotion}
            onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
          />
        </section>

        <section className="surface rounded-sm">
          <div className="px-4 py-3 border-b border-line">
            <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-white/70">Account</h3>
          </div>
          <div className="p-4 text-xs text-white/40 leading-relaxed">
            You're using CyberHack as a guest. Sign-in with email, OAuth, and passkeys is planned but not required —
            anonymous mode will always remain available.
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ title, description, on, onClick }: { title: string; description: string; on: boolean; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm text-white/85">{title}</p>
        <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <Toggle on={on} onClick={onClick} />
    </div>
  );
}