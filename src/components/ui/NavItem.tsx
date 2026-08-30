import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItemProps {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  collapsed?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function NavItem({ to, label, icon: Icon, end, collapsed, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-sm px-2.5 py-2 text-sm transition-colors duration-150',
          isActive ? 'text-white bg-void-800' : 'text-white/55 hover:text-white hover:bg-void-800/60',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-neon transition-opacity duration-150',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          <Icon size={16} className={cn('shrink-0', isActive ? 'text-neon' : 'text-white/45 group-hover:text-white/70')} />
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );
}