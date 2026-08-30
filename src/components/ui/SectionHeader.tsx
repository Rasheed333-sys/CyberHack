import { ReactNode } from 'react';

export default function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        {eyebrow && <p className="mono-label !text-neon/60 mb-1.5">{eyebrow}</p>}
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
        </div>
        {description && <p className="text-xs text-white/40 mt-1.5 max-w-lg leading-relaxed">{description}</p>}
      </div>
      {action}
    </div>
  );
}