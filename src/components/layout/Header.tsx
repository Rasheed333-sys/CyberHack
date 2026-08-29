import { Menu } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import PrivacyIndicator from '@/components/privacy/PrivacyIndicator';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-line shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden h-8 w-8 flex items-center justify-center text-white/60 hover:text-neon"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        {title && <h1 className="font-mono text-xs uppercase tracking-[0.14em] text-white/50 truncate">{title}</h1>}
      </div>
      <PrivacyIndicator />
    </header>
  );
}