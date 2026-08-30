import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'System error',
  message = "CyberHack couldn't complete this request.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-sm border border-warn/25 bg-warn/5 px-4 py-3.5">
      <AlertTriangle size={16} className="text-warn shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] uppercase tracking-wider text-warn">{title}</p>
        <p className="text-sm text-white/60 mt-1">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}