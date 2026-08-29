import { cn } from '@/utils/cn';

export default function PrivacyScore({ score }: { score: number }) {
  const color = score >= 80 ? 'text-neon' : score >= 60 ? 'text-cyan' : 'text-warn';
  const ring = score >= 80 ? '#39ff8a' : score >= 60 ? '#3ee1ff' : '#ff5c5c';
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke={ring}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div>
        <p className={cn('font-mono text-xl font-semibold leading-none', color)}>{score}</p>
        <p className="mono-label !text-white/40 mt-1">/ 100</p>
      </div>
    </div>
  );
}