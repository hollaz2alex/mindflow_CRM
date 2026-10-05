import { useMemo, useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import AdminTabs from '@/components/crm/AdminTabs';
import { slugify } from '@/lib/crmConstants';
import {
  useFieldMeta,
  useFieldOptionRows,
  useAddFieldOption,
  useDeleteFieldOption,
  useReorderFieldOptions,
  useReorderFields,
} from '@/hooks/useFieldOptions';

// Small up/down arrow control for reordering a list item.
function MoveButtons({ onUp, onDown, upDisabled, downDisabled, disabled }) {
  return (
    <span className="flex flex-col">
      <button
        type="button"
        onClick={onUp}
        disabled={disabled || upDisabled}
        className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Move up"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={disabled || downDisabled}
        className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Move down"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </span>
  );
}

export default function FieldOptions() {
  const { fields } = useFieldMeta();
  const { data: rows, isLoading } = useFieldOptionRows();
  const addOption = useAddFieldOption();
  const deleteOption = useDeleteFieldOption();
  const reorderOptions = useReorderFieldOptions();
  const reorderFields = useReorderFields();

  const [inputs, setInputs] = useState({}); // { field: newLabel }
  const [errors, setErrors] = useState({}); // { field: message }
  const [busyId, setBusyId] = useState(null);

  const reordering = reorderOptions.isPending || reorderFields.isPending;

  // Rows come back ordered by field then sort_order, so each group stays ordered.
  const grouped = useMemo(() => {
    const g = {};
    for (const f of fields) g[f.field] = [];
    for (const r of rows || []) {
      if (!g[r.field]) g[r.field] = [];
      g[r.field].push(r);
    }
    return g;
  }, [rows, fields]);

  const moveField = async (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[index], next[j]] = [next[j], next[index]];
    await reorderFields.mutateAsync(
      next.map((f, i) => ({ field: f.field, sort_order: (i + 1) * 10 }))
    );
  };

  const moveOption = async (field, index, dir) => {
    const list = grouped[field] || [];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[index], next[j]] = [next[j], next[index]];
    await reorderOptions.mutateAsync(
      next.map((o, i) => ({ id: o.id, sort_order: (i + 1) * 10 }))
    );
  };

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
            Manage, reorder, and add options for each dropdown.
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
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {fields.map(({ field, label }, fIndex) => (
            <Card key={field}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold">{label}</h2>
                    <p className="text-xs text-gray-400">
                      {(grouped[field] || []).length} option
                      {(grouped[field] || []).length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <MoveButtons
                    onUp={() => moveField(fIndex, -1)}
                    onDown={() => moveField(fIndex, 1)}
                    upDisabled={fIndex === 0}
                    downDisabled={fIndex === fields.length - 1}
                    disabled={reordering}
                  />
                </div>

                <ul className="space-y-1.5">
                  {(grouped[field] || []).map((opt, oIndex) => (
                    <li
                      key={opt.id}
                      className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5 text-sm"
                    >
                      <MoveButtons
                        onUp={() => moveOption(field, oIndex, -1)}
                        onDown={() => moveOption(field, oIndex, 1)}
                        upDisabled={oIndex === 0}
                        downDisabled={oIndex === (grouped[field] || []).length - 1}
                        disabled={reordering}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-gray-900">
                          {opt.label}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                          {opt.value}
                        </span>
                      </span>
                      {opt.is_default && (
                        <span className="text-xs text-gray-400">default</span>
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

      <p className={cn('text-xs text-gray-400', reordering && 'opacity-60')}>
        Option order here is the order they appear in every dropdown. Field order
        affects this page only. Any option can be removed, including built-in
        defaults — records already using it keep the value.
      </p>
    </div>
  );
}
