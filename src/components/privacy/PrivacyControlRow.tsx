import { ReactNode } from 'react';
import StatusBadge, { type Status } from '@/components/ui/StatusBadge';

export interface ControlRowData {
  icon: ReactNode;
  title: string;
  description: string;
  status: Status;
  note?: string;
}

export default function PrivacyControlRow({ icon, title, description, status, note }: ControlRowData) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <div className="h-8 w-8 rounded-sm border border-line flex items-center justify-center shrink-0 text-white/45">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white/90">{title}</p>
        <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{description}</p>
        {note && <p className="text-[11px] text-white/25 mt-1 font-mono">{note}</p>}
      </div>
      <div className="shrink-0 mt-0.5">
        <StatusBadge status={status} size="sm" />
      </div>
    </div>
  );
}