import { motion } from 'framer-motion';
import { Sparkles, Globe, Compass, ShieldCheck, ScanEye } from 'lucide-react';
import { Wordmark } from '@/components/ui/LogoMark';
import { useAppStore } from '@/store/useAppStore';

const CAPABILITIES = [
  { label: 'AI', icon: Sparkles },
  { label: 'Web Search', icon: Globe },
  { label: 'Research', icon: Compass },
  { label: 'Privacy', icon: ShieldCheck },
  { label: 'Security', icon: ScanEye },
];

function SystemLine({ label, status, ok }: { label: string; status: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between font-mono text-[11px] py-1.5">
      <span className="text-white/35 uppercase tracking-[0.08em]">{label}</span>
      <span className={`flex items-center gap-1.5 uppercase tracking-[0.08em] ${ok ? 'text-neon' : 'text-white/35'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-neon animate-pulseRing' : 'bg-white/25'}`} />
        {status}
      </span>
    </div>
  );
}

export default function WelcomeScreen() {
  const privacyState = useAppStore((s) => s.privacyState);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <Wordmark className="scale-125" />
        </div>

        <p className="mono-label !text-white/45 mb-2">Private intelligence for the open web</p>
        <p className="text-sm text-white/45 leading-relaxed max-w-sm mx-auto">
          Ask anything. Research anything. Explore the web without giving it away.
        </p>

        {/* Capability strip */}
        <div className="mt-7 flex items-center justify-center flex-wrap gap-2">
          {CAPABILITIES.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/40"
            >
              <Icon size={11} className="text-white/30" />
              {label}
            </span>
          ))}
        </div>

        {/* System status panel */}
        <div className="mt-8 rounded-sm border border-line bg-void-900/60 px-4 py-1 text-left divide-y divide-line/60">
          <SystemLine label="CyberHack core" status="online" ok />
          <SystemLine label="AI engine" status="ready" ok />
          <SystemLine label="Web access" status="standby" ok={false} />
          <SystemLine label="Privacy" status={privacyState.mode === 'standard' ? 'standard' : 'active'} ok={privacyState.mode !== 'standard'} />
        </div>
      </motion.div>
    </div>
  );
}