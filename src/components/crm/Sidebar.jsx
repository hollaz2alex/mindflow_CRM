import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Activity,
  ShieldCheck,
  LogOut,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/contacts', label: 'Contacts', icon: Users, end: false },
  { to: '/activity', label: 'Activity', icon: Activity, end: false },
];

export default function Sidebar({ onNavigate }) {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
          <Zap className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">MindFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            <ShieldCheck className="h-4.5 w-4.5" />
            Admin
          </NavLink>
        )}
      </nav>

      {/* Footer / user */}
      <div className="border-t border-gray-100 p-3">
        {user?.email && (
          <div className="mb-2 truncate px-3 py-1 text-xs text-gray-400">
            {user.email}
          </div>
        )}
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log out
        </button>
      </div>
    </div>
  );
}
