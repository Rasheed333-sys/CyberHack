import { cn } from '@/utils/cn';

export default function Toggle({
  on,
  onClick,
  disabled,
  label,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed',
        on ? 'bg-neon/80' : 'bg-void-700',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-void-950 transition-transform duration-150',
          on ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}