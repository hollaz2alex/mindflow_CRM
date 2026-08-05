import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

// Query keys (kept identical to the contract in CLAUDE.md):
//   ['contacts']        — all contacts
//   ['contact', id]     — single contact

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useContact(id) {
  return useQuery({
    queryKey: ['contact', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newContact) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(newContact)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', data.id] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.removeQueries({ queryKey: ['contact', id] });
      // Activities cascade-delete in the DB; drop them from cache too.
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

// Batch-insert for CSV import. Inserts in groups of 50 and reports how many
// rows succeeded vs failed per batch.
export function useImportContacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows) => {
      let inserted = 0;
      let failed = 0;
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const { data, error } = await supabase
          .from('contacts')
          .insert(batch)
          .select('id');
        if (error) {
          failed += batch.length;
        } else {
          inserted += data.length;
        }
      }
      return { inserted, failed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
