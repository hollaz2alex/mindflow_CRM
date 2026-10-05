import { useMemo, useState } from 'react';
import { SlidersHorizontal, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import AdminTabs from '@/components/crm/AdminTabs';
import { slugify } from '@/lib/crmConstants';
import {
  FIELD_META,
  useFieldOptionRows,
  useAddFieldOption,
  useDeleteFieldOption,
} from '@/hooks/useFieldOptions';

export default function FieldOptions() {
  const { data: rows, isLoading } = useFieldOptionRows();
  const addOption = useAddFieldOption();
  const deleteOption = useDeleteFieldOption();

  const [inputs, setInputs] = useState({}); // { field: newLabel }
  const [errors, setErrors] = useState({}); // { field: message }
  const [busyId, setBusyId] = useState(null);

  const grouped = useMemo(() => {
    const g = Object.fromEntries(FIELD_META.map((f) => [f.field, []]));
    for (const r of rows || []) {
      if (g[r.field]) g[r.field].push(r);
    }
    return g;
  }, [rows]);

  const handleAdd = async (field) => {
    const label = (inputs[field] || '').trim();
    setErrors((e) => ({ ...e, [field]: '' }));
    if (!label) return;
    const value = slugify(label);
    if (!value) {
      setErrors((e) => ({ ...e, [field]: 'Enter a valid name.' }));
      return;
    }
    if ((grouped[field] || []).some((o) => o.value === value)) {
      setErrors((e) => ({ ...e, [field]: 'That option already exists.' }));
      return;
    }
    const maxSort = Math.max(
      0,
      ...(grouped[field] || []).map((o) => o.sort_order || 0)
    );
    try {
      await addOption.mutateAsync({
        field,
        value,
        label,
        sort_order: maxSort + 10,
      });
      setInputs((i) => ({ ...i, [field]: '' }));
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [field]: err.message || 'Could not add that option.',
      }));
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await deleteOption.mutateAsync(id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-olive to-brand-moss text-white">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-sm text-gray-500">
            Manage the options that appear in each dropdown.
          </p>
        </div>
      </div>

      <AdminTabs />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {FIELD_META.map(({ field, label }) => (
            <Card key={field}>
              <CardContent className="p-5">
                <h2 className="text-base font-bold">{label}</h2>
                <p className="mb-3 text-xs text-gray-400">
                  {(grouped[field] || []).length} option
                  {(grouped[field] || []).length === 1 ? '' : 's'}
                </p>

                <ul className="space-y-1.5">
                  {(grouped[field] || []).map((opt) => (
                    <li
                      key={opt.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="font-medium text-gray-900">
                          {opt.label}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                          {opt.value}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        {opt.is_default && (
                          <span
                            className="text-xs text-gray-400"
                            title="Built-in option"
                          >
                            default
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(opt.id)}
                          disabled={busyId === opt.id}
                          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                          aria-label={`Remove ${opt.label}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex gap-2">
                  <Input
                    value={inputs[field] || ''}
                    onChange={(e) =>
                      setInputs((i) => ({ ...i, [field]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd(field)}
                    placeholder={`Add a ${label.toLowerCase()} option`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAdd(field)}
                    disabled={addOption.isPending}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {errors[field] && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors[field]}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Any option can be removed, including built-in defaults. Removing one
        doesn&apos;t change records that already use it — they keep the value and
        just can&apos;t be re-selected to it. Custom options show with a neutral
        badge color.
      </p>
    </div>
  );
}
