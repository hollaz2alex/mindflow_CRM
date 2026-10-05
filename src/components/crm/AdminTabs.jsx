import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TABS = [
  { to: '/admin', label: 'Users', end: true },
  { to: '/admin/options', label: 'Dropdown Options', end: false },
];

export default function AdminTabs() {
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-brand-olive text-brand-olive'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            )
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
