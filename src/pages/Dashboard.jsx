import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from 'recharts';
import { Users, UserPlus, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MetricCard from '@/components/crm/MetricCard';
import StageBar from '@/components/crm/StageBar';
import { useContacts } from '@/hooks/useContacts';
import { useActivities } from '@/hooks/useActivities';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_HEX,
} from '@/lib/crmConstants';
import { ACTIVITY_ICON, ACTIVITY_ICON_COLOR } from '@/lib/activityIcons';
import { fullName, relativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  return d >= weekAgo && d <= now;
}

export default function Dashboard() {
  const { data: contacts, isLoading } = useContacts();
  const { data: activities } = useActivities();

  const metrics = useMemo(() => {
    const list = contacts || [];
    const total = list.length;
    const newThisWeek = list.filter((c) => isThisWeek(c.created_date)).length;
    const converted = list.filter((c) => c.stage === 'converted').length;
    const conversionRate = total ? Math.round((converted / total) * 100) : 0;

    const stageCounts = {};
    const categoryCounts = {};
    for (const c of list) {
      stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }

    return { total, newThisWeek, converted, conversionRate, stageCounts, categoryCounts };
  }, [contacts]);

  const categoryData = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        count: metrics.categoryCounts[cat] || 0,
        fill: CATEGORY_HEX[cat],
      })).filter((d) => d.count > 0),
    [metrics.categoryCounts]
  );

  const recent = (activities || []).slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Your pipeline at a glance.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Contacts"
          value={metrics.total}
          icon={Users}
          accent="bg-indigo-50 text-indigo-600"
        />
        <MetricCard
          label="New This Week"
          value={metrics.newThisWeek}
          icon={UserPlus}
          accent="bg-violet-50 text-violet-600"
        />
        <MetricCard
          label="Converted"
          value={metrics.converted}
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
          accent="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <StageBar counts={metrics.stageCounts} />
          </CardContent>
        </Card>

        {/* Category chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contacts by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No contacts yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, categoryData.length * 40)}>
                <BarChart
                  layout="vertical"
                  data={categoryData}
                  margin={{ left: 8, right: 16, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={110}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    formatter={(value) => [value, 'Contacts']}
                    labelStyle={{ color: '#111827' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                    {categoryData.map((d) => (
                      <Cell key={d.category} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Activity</CardTitle>
          <Link
            to="/activity"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No activity logged yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {recent.map((a) => {
                const Icon = ACTIVITY_ICON[a.type] || ACTIVITY_ICON.other;
                return (
                  <li key={a.id} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        ACTIVITY_ICON_COLOR[a.type] || ACTIVITY_ICON_COLOR.other
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {a.title}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {a.contacts ? fullName(a.contacts) : 'Unknown contact'}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {relativeTime(a.created_date)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
