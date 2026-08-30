import { ReactNode } from 'react';

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="mb-4 h-10 w-10 rounded-sm border border-line flex items-center justify-center text-white/30">
          {icon}
        </div>
      )}
      <p className="text-sm text-white/60">{title}</p>
      {description && <p className="text-xs text-white/35 mt-1.5 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}