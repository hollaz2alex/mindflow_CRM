import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity as ActivityIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivities } from '@/hooks/useActivities';
import { ACTIVITY_ICON, ACTIVITY_ICON_COLOR } from '@/lib/activityIcons';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS } from '@/lib/crmConstants';
import {
  fullName,
  formatDateTime,
  dateGroupLabel,
  dateGroupKey,
} from '@/lib/format';
import { cn } from '@/lib/utils';

const ALL = '__all__';

export default function ActivityPage() {
  const { data: activities, isLoading } = useActivities();
  const [filter, setFilter] = useState(ALL);

  const filtered = useMemo(() => {
    const list = activities || [];
    return filter === ALL ? list : list.filter((a) => a.type === filter);
  }, [activities, filter]);

  // Group into ordered [{ key, label, items }] buckets (already sorted desc).
  const groups = useMemo(() => {
    const map = new Map();
    for (const a of filtered) {
      const key = dateGroupKey(a.created_date);
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: dateGroupLabel(a.created_date),
          items: [],
        });
      }
      map.get(key).items.push(a);
    }
    return Array.from(map.values());
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
        <p className="text-sm text-gray-500">Everything logged across your contacts.</p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <FilterPill
          active={filter === ALL}
          onClick={() => setFilter(ALL)}
          label="All"
        />
        {ACTIVITY_TYPES.map((type) => {
          const Icon = ACTIVITY_ICON[type];
          return (
            <FilterPill
              key={type}
              active={filter === type}
              onClick={() => setFilter(type)}
              label={ACTIVITY_TYPE_LABELS[type]}
              icon={Icon}
            />
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <ActivityIcon className="h-6 w-6 text-gray-400" />
          </div>
          <p className="mt-4 font-medium text-gray-900">No activity</p>
          <p className="text-sm text-gray-500">
            {filter === ALL
              ? 'Log an activity from a contact to see it here.'
              : 'No activities of this type yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key}>
              <h2 className="sticky top-0 z-10 -mx-1 bg-brand-cream/90 px-1 py-2 text-sm font-semibold text-gray-500 backdrop-blur">
                {group.label}
              </h2>
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-100">
                    {group.items.map((a) => (
                      <ActivityRow key={a.id} activity={a} />
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, label, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-brand-olive text-white'
          : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-brand-cream'
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function ActivityRow({ activity: a }) {
  const Icon = ACTIVITY_ICON[a.type] || ACTIVITY_ICON.other;
  return (
    <li className="flex items-start gap-3 p-4">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          ACTIVITY_ICON_COLOR[a.type] || ACTIVITY_ICON_COLOR.other
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <p className="font-medium text-gray-900">{a.title}</p>
          <span className="text-xs text-gray-400">
            {formatDateTime(a.created_date)}
          </span>
        </div>
        {a.description && (
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-600">
            {a.description}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {a.contacts ? (
            <Link
              to={`/contacts/${a.contacts.id}`}
              className="font-medium text-brand-olive hover:underline"
            >
              {fullName(a.contacts)}
            </Link>
          ) : (
            'Unknown contact'
          )}
          {a.logged_by ? ` · ${a.logged_by}` : ''}
        </p>
      </div>
    </li>
  );
}
