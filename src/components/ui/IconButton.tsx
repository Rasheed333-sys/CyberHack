import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: 'sm' | 'md';
  icon: ReactNode;
  label: string; // used for aria-label + title tooltip
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, active, size = 'md', icon, label, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-sm transition-colors duration-150',
          size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
          disabled
            ? 'text-white/20 cursor-not-allowed'
            : active
              ? 'text-neon bg-neon/10 border border-neon/30'
              : 'text-white/45 hover:text-white hover:bg-void-800 border border-transparent',
          className,
        )}
        {...props}
      >
        {icon}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';

export default IconButton;