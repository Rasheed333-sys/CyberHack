import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Search, Globe, Compass, ShieldCheck, Settings, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { relativeTime } from '@/utils/time';

const NAV_ITEMS = [
  { to: '/', label: 'New Chat', icon: Plus, exact: true },
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-y-0 left-0 z-50 w-[82%] max-w-[300px] bg-void-950 border-r border-line flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-line">
              <span className="font-mono text-sm font-semibold tracking-[0.08em]">
                CYBER<span className="text-neon">HACK</span>
              </span>
              <button onClick={() => setOpen(false)} className="h-7 w-7 flex items-center justify-center text-white/60">
                <X size={16} />
              </button>
            </div>
            <nav className="px-2 py-3 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={(e) => {
                      setOpen(false);
                      if (item.to === '/') {
                        e.preventDefault();
                        startNewConversation();
                        navigate('/');
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm ${
                        isActive ? 'bg-neon/10 text-neon border border-neon/30' : 'text-white/70 border border-transparent'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
            <div className="flex-1 overflow-y-auto px-2">
              <div className="mono-label px-3 pb-2">History</div>
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    selectConversation(c.id);
                    setOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 rounded-sm hover:bg-void-800 text-white/70"
                >
                  <p className="truncate text-[13px]">{c.title}</p>
                  <p className="mono-label !text-[10px] !text-white/30">{relativeTime(c.updatedAt)}</p>
                </button>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}