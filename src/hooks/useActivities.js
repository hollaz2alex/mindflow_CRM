import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

// Query keys:
//   ['activities']              — global feed (joined with contact name)
//   ['activities', contactId]   — one contact's timeline

const CONTACT_JOIN = '*, contacts ( id, first_name, last_name )';

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(CONTACT_JOIN)
        .order('created_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useContactActivities(contactId) {
  return useQuery({
    queryKey: ['activities', contactId],
    enabled: !!contactId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newActivity) => {
      const { data, error } = await supabase
        .from('activities')
        .insert(newActivity)
        .select()
        .single();
      if (error) throw error;
      return data;
      // NOTE: contacts.last_contacted is maintained by the AFTER INSERT trigger
      // in the DB. Do NOT update it from here — that's a redundant write and a
      // second RLS check for no benefit.
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({
        queryKey: ['activities', data.contact_id],
      });
      // last_contacted changed on the contact via trigger — refresh it.
      queryClient.invalidateQueries({ queryKey: ['contact', data.contact_id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
