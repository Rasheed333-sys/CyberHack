import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Globe, Compass, ShieldCheck, Settings, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { relativeTime, groupByDate } from '@/utils/time';
import { Wordmark } from '@/components/ui/LogoMark';
import NavItem from '@/components/ui/NavItem';

const NAV_ITEMS = [
  { to: '/search', label: 'Search', icon: Search },
  { to: '/secure-browse', label: 'Secure Browse', icon: Globe },
  { to: '/research', label: 'Research', icon: Compass },
  { to: '/privacy', label: 'Privacy Center', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileSidebar() {
  const open = useAppStore((s) => s.mobileSidebarOpen);
  const setOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const conversations = useAppStore((s) => s.conversations);
  const selectConversation = useAppStore((s) => s.selectConversation);
  const startNewConversation = useAppStore((s) => s.startNewConversation);
  const navigate = useNavigate();
  const grouped = groupByDate(
    [...conversations].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-y-0 left-0 z-50 w-[84%] max-w-[300px] bg-void-950 border-r border-line flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-line">
              <Wordmark />
              <button onClick={() => setOpen(false)} className="h-7 w-7 flex items-center justify-center text-white/50" aria-label="Close menu">
                <X size={16} />
              </button>
            </div>

            <div className="px-2.5 pt-3">
              <button
                onClick={() => {
                  startNewConversation();
                  setOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center gap-2.5 rounded-sm border border-neon/25 bg-neon/[0.06] text-neon text-sm px-2.5 py-2.5 mb-3"
              >
                <Plus size={16} />
                <span className="font-medium">New Chat</span>
              </button>

              <nav className="space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} onClick={() => setOpen(false)} />
                ))}
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto px-2.5 pt-4">
              <div className="mono-label px-2 pb-2">History</div>
              {grouped.length === 0 && <p className="px-2 text-xs text-white/25 font-mono">No conversations yet</p>}
              {grouped.map((group) => (
                <div key={group.label} className="mb-3">
                  <p className="px-2 pb-1 font-mono text-[10px] uppercase tracking-[0.1em] text-white/25">{group.label}</p>
                  {group.items.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        selectConversation(c.id);
                        setOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-2 py-2 rounded-sm hover:bg-void-800 text-white/65 flex items-center justify-between gap-2"
                    >
                      <p className="truncate text-[13px]">{c.title}</p>
                      <span className="mono-label !text-[9px] !text-white/25 shrink-0">{relativeTime(c.updatedAt)}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}