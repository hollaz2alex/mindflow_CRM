import { useMemo, useState } from 'react';
import { ShieldCheck, Check, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import AdminTabs from '@/components/crm/AdminTabs';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, useUpdateUser } from '@/hooks/useProfile';
import {
  USER_STATUSES,
  USER_STATUS_LABELS,
  USER_STATUS_BADGE,
  USER_ROLE_LABELS,
  USER_ROLE_BADGE,
} from '@/lib/crmConstants';
import { formatDate } from '@/lib/format';

const ALL = '__all__';

export default function Admin() {
  const { user } = useAuth();
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const [filter, setFilter] = useState(ALL);
  const [pendingId, setPendingId] = useState(null);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    for (const u of users || []) c[u.status] = (c[u.status] || 0) + 1;
    return c;
  }, [users]);

  const filtered = useMemo(() => {
    const list = users || [];
    return filter === ALL ? list : list.filter((u) => u.status === filter);
  }, [users, filter]);

  const act = async (id, updates) => {
    setPendingId(id);
    try {
      await updateUser.mutateAsync({ id, updates });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-olive to-brand-moss text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-sm text-gray-500">
            Approve, reject, and manage roles.
          </p>
        </div>
      </div>

      <AdminTabs />

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <FilterPill active={filter === ALL} onClick={() => setFilter(ALL)}>
          All ({(users || []).length})
        </FilterPill>
        {USER_STATUSES.map((s) => (
          <FilterPill
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
          >
            {USER_STATUS_LABELS[s]} ({counts[s] || 0})
          </FilterPill>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              No users in this view.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-brand-cream text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((u) => {
                    const isSelf = u.id === user?.id;
                    const busy = pendingId === u.id;
                    return (
                      <tr key={u.id} className="align-middle">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {u.full_name || u.email || '—'}
                            {isSelf && (
                              <span className="ml-2 text-xs font-normal text-gray-400">
                                (you)
                              </span>
                            )}
                          </div>
                          {u.full_name && u.email && (
                            <div className="text-xs text-gray-500">
                              {u.email}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'border-transparent',
                              USER_ROLE_BADGE[u.role]
                            )}
                          >
                            {USER_ROLE_LABELS[u.role]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'border-transparent',
                              USER_STATUS_BADGE[u.status]
                            )}
                          >
                            {USER_STATUS_LABELS[u.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatDate(u.created_date)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            {u.status !== 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() =>
                                  act(u.id, { status: 'approved' })
                                }
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                            )}
                            {u.status !== 'rejected' && !isSelf && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-600 hover:text-rose-700"
                                disabled={busy}
                                onClick={() =>
                                  act(u.id, { status: 'rejected' })
                                }
                              >
                                <X className="h-3.5 w-3.5" />
                                {u.status === 'approved' ? 'Revoke' : 'Reject'}
                              </Button>
                            )}
                            {!isSelf &&
                              (u.role === 'admin' ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={busy}
                                  onClick={() => act(u.id, { role: 'member' })}
                                >
                                  <ArrowDownCircle className="h-3.5 w-3.5" />
                                  Demote
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={busy}
                                  onClick={() => act(u.id, { role: 'admin' })}
                                >
                                  <ArrowUpCircle className="h-3.5 w-3.5" />
                                  Make admin
                                </Button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">
        Note: rejecting a user blocks their access but doesn&apos;t delete their
        auth account. Fully deleting an account requires the Supabase admin API
        (service role).
      </p>
    </div>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-brand-olive text-white'
          : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-brand-cream'
      )}
    >
      {children}
    </button>
  );
}
