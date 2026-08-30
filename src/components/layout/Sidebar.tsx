import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Globe,
  Compass,
  ShieldCheck,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Trash2,
  Pencil,
  User,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { relativeTime, groupByDate } from '@/utils/time';
import { cn } from '@/utils/cn';
import { Wordmark } from '@/components/ui/LogoMark';
import NavItem from '@/components/ui/NavItem';
import StatusBadge from '@/components/ui/StatusBadge';

const NAV_ITEMS = [
  { to: '/search', label: 'Search', icon: Search },
  { to: '/secure-browse', label: 'Secure Browse', icon: Globe },
  { to: '/research', label: 'Research', icon: Compass },
  { to: '/privacy', label: 'Privacy Center', icon: ShieldCheck },
];

export default function Sidebar() {
  const collapsed = !useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const conversations = useAppStore((s) => s.conversations);
  const currentId = useAppStore((s) => s.currentConversationId);
  const selectConversation = useAppStore((s) => s.selectConversation);
  const deleteConversation = useAppStore((s) => s.deleteConversation);
  const startNewConversation = useAppStore((s) => s.startNewConversation);
  const privacyState = useAppStore((s) => s.privacyState);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const navigate = useNavigate();

  const sorted = useMemo(
    () => [...conversations].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [conversations],
  );
  const grouped = useMemo(() => groupByDate(sorted), [sorted]);

  const handleNewChat = () => {
    startNewConversation();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        'hidden md:flex h-screen flex-col border-r border-line bg-void-950 transition-[width] duration-200 ease-out',
        collapsed ? 'w-[64px]' : 'w-[268px]',
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-3.5 py-4 border-b border-line">
        <Wordmark collapsed={collapsed} />
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="h-6 w-6 shrink-0 flex items-center justify-center rounded-sm text-white/40 hover:text-neon hover:bg-void-800 transition-colors"
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>

      {/* New chat + nav */}
      <div className="px-2.5 pt-3">
        <button
          onClick={handleNewChat}
          title={collapsed ? 'New chat' : undefined}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-sm border border-neon/25 bg-neon/[0.06] text-neon text-sm px-2.5 py-2 hover:bg-neon/10 hover:border-neon/40 transition-colors mb-3',
          )}
        >
          <Plus size={16} className="shrink-0" />
          {!collapsed && <span className="font-medium">New Chat</span>}
        </button>

        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} collapsed={collapsed} />
          ))}
        </nav>
      </div>

      {/* History */}
      {!collapsed && (
        <div className="flex-1 min-h-0 flex flex-col px-2.5 pt-4">
          <div className="mono-label px-2 pb-2">History</div>
          <div className="flex-1 overflow-y-auto pb-2 space-y-3">
            {grouped.length === 0 && (
              <p className="px-2 text-xs text-white/25 font-mono">No conversations yet</p>
            )}
            {grouped.map((group) => (
              <div key={group.label}>
                <p className="px-2 pb-1 font-mono text-[10px] uppercase tracking-[0.1em] text-white/25">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        'group relative flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer transition-colors',
                        currentId === c.id
                          ? 'bg-void-800 text-white'
                          : 'text-white/55 hover:bg-void-800/60 hover:text-white',
                      )}
                      onClick={() => {
                        selectConversation(c.id);
                        navigate('/');
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] leading-tight">{c.title}</p>
                      </div>
                      <span className="mono-label !text-[9px] !text-white/25 shrink-0 group-hover:hidden">
                        {relativeTime(c.updatedAt).replace(' ago', '')}
                      </span>
                      <button
                        aria-label="Conversation options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === c.id ? null : c.id);
                        }}
                        className="hidden group-hover:flex shrink-0 h-5 w-5 items-center justify-center rounded-sm hover:bg-void-700 text-white/50 hover:text-white transition-colors"
                      >
                        <MoreHorizontal size={13} />
                      </button>
                      {menuOpenId === c.id && (
                        <div
                          className="absolute right-1 top-8 z-20 w-36 rounded-sm border border-line bg-void-850 shadow-panel py-1 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-void-700 text-white/70 hover:text-white">
                            <Pencil size={12} /> Rename
                          </button>
                          <button
                            onClick={() => {
                              deleteConversation(c.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-void-700 text-warn/80 hover:text-warn"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {collapsed && <div className="flex-1" />}

      {/* Footer */}
      <div className="border-t border-line p-2.5 space-y-2">
        <NavItem to="/settings" label="Settings" icon={Settings} collapsed={collapsed} />

        <div className={cn('flex items-center gap-2 rounded-sm px-2 py-1.5', !collapsed && 'border border-line')}>
          <div className="h-6 w-6 rounded-full bg-void-800 border border-line flex items-center justify-center shrink-0">
            <User size={12} className="text-white/45" />
          </div>
          {!collapsed && (
            <>
              <span className="text-xs text-white/45 flex-1 truncate">Guest session</span>
              <StatusBadge
                status={privacyState.mode === 'standard' ? 'standby' : 'active'}
                label={privacyState.mode === 'standard' ? 'STD' : privacyState.mode === 'private' ? 'PRV' : 'HI-PRV'}
                size="sm"
              />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}