import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import {
  CATEGORIES,
  STAGES,
  SOURCES,
  CLIENT_TYPES,
  ACTIVITY_TYPES,
  BRANDS,
  CATEGORY_LABELS,
  STAGE_LABELS,
  SOURCE_LABELS,
  CLIENT_TYPE_LABELS,
  ACTIVITY_TYPE_LABELS,
  BRAND_LABELS,
} from '@/lib/crmConstants';

export const FIELD_META = [
  { field: 'category', label: 'Category' },
  { field: 'stage', label: 'Stage' },
  { field: 'source', label: 'Source' },
  { field: 'client_type', label: 'Client Type' },
  { field: 'activity_type', label: 'Activity Type' },
  { field: 'brand', label: 'Brand' },
];

// Built-in options used as a fallback when the DB is empty or unreachable, so
// the app's dropdowns still work (e.g. before the migration runs).
const FALLBACK = {
  category: CATEGORIES.map((v) => ({ value: v, label: CATEGORY_LABELS[v] })),
  stage: STAGES.map((v) => ({ value: v, label: STAGE_LABELS[v] })),
  source: SOURCES.map((v) => ({ value: v, label: SOURCE_LABELS[v] })),
  client_type: CLIENT_TYPES.map((v) => ({
    value: v,
    label: CLIENT_TYPE_LABELS[v],
  })),
  activity_type: ACTIVITY_TYPES.map((v) => ({
    value: v,
    label: ACTIVITY_TYPE_LABELS[v],
  })),
  brand: BRANDS.map((v) => ({ value: v, label: BRAND_LABELS[v] })),
};

function fetchOptions() {
  return supabase
    .from('field_options')
    .select('*')
    .order('field')
    .order('sort_order')
    .then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
}

// Grouped { field: [{value,label}] } for populating selects. Falls back to the
// built-in constants per field when that field has no rows.
export function useFieldOptions() {
  const query = useQuery({
    queryKey: ['field_options'],
    queryFn: fetchOptions,
    staleTime: 5 * 60_000,
  });

  const options = useMemo(() => {
    const rows = query.data;
    if (!rows || rows.length === 0) return FALLBACK;
    const grouped = {
      category: [],
      stage: [],
      source: [],
      client_type: [],
      activity_type: [],
      brand: [],
    };
    for (const r of rows) {
      if (grouped[r.field]) grouped[r.field].push({ value: r.value, label: r.label });
    }
    for (const key of Object.keys(FALLBACK)) {
      if (grouped[key].length === 0) grouped[key] = FALLBACK[key];
    }
    return grouped;
  }, [query.data]);

  return { options, isLoading: query.isLoading, isError: query.isError };
}

// Raw rows (with id / is_default) for the admin management screen.
export function useFieldOptionRows() {
  return useQuery({ queryKey: ['field_options'], queryFn: fetchOptions });
}

export function useAddFieldOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ field, value, label, sort_order }) => {
      const { data, error } = await supabase
        .from('field_options')
        .insert({ field, value, label, sort_order: sort_order ?? 100 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['field_options'] }),
  });
}

export function useDeleteFieldOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('field_options')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['field_options'] }),
  });
}
