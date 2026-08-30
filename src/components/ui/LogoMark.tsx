import { cn } from '@/utils/cn';

/**
 * Minimal technical logo mark: a shield outline with a circuit notch and a
 * center node, rendered in the neon accent. Deliberately small and simple —
 * this is not a full illustration.
 */
export default function LogoMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <path
        d="M12 2.5 4 5.5v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10v-6l-8-3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8.5 11.5 11 14l4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function Wordmark({ className, collapsed }: { className?: string; collapsed?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)}>
      <div className="h-7 w-7 shrink-0 rounded-sm border border-neon/40 bg-neon/[0.06] flex items-center justify-center">
        <LogoMark size={15} className="text-neon" />
      </div>
      {!collapsed && (
        <span className="font-mono text-[13px] font-semibold tracking-[0.08em] text-white truncate">
          CYBER<span className="text-neon">HACK</span>
        </span>
      )}
    </div>
  );
}