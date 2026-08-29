import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
import { relativeTime } from '@/utils/time';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { to: '/', label: 'New Chat', icon: Plus, exact: true },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/secure-browse', label: 'Secure Browse', icon: Globe },
  { to: '/research', label: 'Research', icon: Compass },
  { to: '/privacy', label: 'Privacy Center', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
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

  return (
    <aside
      className={cn(
        'hidden md:flex h-screen flex-col border-r border-line bg-void-950 transition-[width] duration-200 ease-out',
        collapsed ? 'w-[64px]' : 'w-[280px]',
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-line">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 shrink-0 rounded-sm border border-neon/40 bg-neon/10 flex items-center justify-center">
              <span className="text-neon font-mono text-sm font-bold">C</span>
            </div>
            <span className="font-mono text-sm font-semibold tracking-[0.08em] truncate">
              CYBER<span className="text-neon">HACK</span>
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="h-7 w-7 flex items-center justify-center rounded-sm text-white/50 hover:text-neon hover:bg-void-800 transition-colors"
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const handleClick = (e: React.MouseEvent) => {
            if (item.to === '/') {
              e.preventDefault();
              startNewConversation();
              navigate('/');
            }
          };
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleClick}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-sm px-2.5 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-neon/10 text-neon border border-neon/30'
                    : 'text-white/65 border border-transparent hover:text-white hover:bg-void-800',
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* History */}
      {!collapsed && (
        <div className="flex-1 min-h-0 flex flex-col px-2 pt-3">
          <div className="mono-label px-2.5 pb-2">History</div>
          <div className="flex-1 overflow-y-auto space-y-0.5 pb-2">
            {sorted.length === 0 && (
              <p className="px-2.5 text-xs text-white/30 font-mono">No conversations yet</p>
            )}
            {sorted.map((c) => (
              <div
                key={c.id}
                className={cn(
                  'group relative flex items-center gap-2 rounded-sm px-2.5 py-2 cursor-pointer transition-colors',
                  currentId === c.id
                    ? 'bg-void-800 text-white'
                    : 'text-white/60 hover:bg-void-800/70 hover:text-white',
                )}
                onClick={() => {
                  selectConversation(c.id);
                  navigate('/');
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] leading-tight">{c.title}</p>
                  <p className="mono-label !text-[10px] !text-white/30">{relativeTime(c.updatedAt)}</p>
                </div>
                <button
                  aria-label="Conversation options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === c.id ? null : c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 shrink-0 h-6 w-6 flex items-center justify-center rounded-sm hover:bg-void-700 text-white/50 hover:text-white transition-opacity"
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpenId === c.id && (
                  <div
                    className="absolute right-1 top-9 z-20 w-36 surface-raised rounded-sm shadow-neon py-1 text-xs"
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
      )}

      {/* Footer: privacy status + user */}
      <div className="border-t border-line p-3 space-y-2">
        <NavLink
          to="/privacy"
          className="flex items-center gap-2 rounded-sm border border-line px-2.5 py-2 hover:border-neon/30 transition-colors"
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full shrink-0',
              privacyState.mode === 'standard' ? 'bg-white/30' : 'bg-neon animate-pulseRing',
            )}
          />
          {!collapsed && (
            <span className="mono-label !text-white/60 truncate">
              {privacyState.mode === 'standard' ? 'STANDARD MODE' : privacyState.mode.toUpperCase().replace('-', ' ')}
            </span>
          )}
        </NavLink>
        <div className="flex items-center gap-2 px-1">
          <div className="h-7 w-7 rounded-full bg-void-800 border border-line flex items-center justify-center shrink-0">
            <User size={13} className="text-white/50" />
          </div>
          {!collapsed && <span className="text-xs text-white/50 truncate">Guest session</span>}
        </div>
      </div>
    </aside>
  );
}