import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
  children: ReactNode;
}

export default function Panel({ title, icon, action, padded = false, className, children, ...props }: PanelProps) {
  return (
    <section className={cn('rounded-sm border border-line bg-void-900/70', className)} {...props}>
      {title && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line">
          <div className="flex items-center gap-2 min-w-0">
            {icon}
            <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60 truncate">{title}</h3>
          </div>
          {action}
        </div>
      )}
      <div className={padded ? 'p-4' : ''}>{children}</div>
    </section>
  );
}