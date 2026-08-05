import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

// Query keys:
//   ['profile', userId] — the current user's own profile (status + role)
//   ['users']           — all profiles (admin only; RLS enforces this)

// The signed-in user's profile. RLS lets any user read their own row, so this
// works even while pending — that's how we know to show the pending screen.
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      // If the signup trigger hasn't landed the row yet, treat as pending.
      return data ?? { id: user.id, status: 'pending', role: 'member' };
    },
  });
}

// All users, for the admin panel. A non-admin calling this only gets their own
// row back (RLS), but the panel is admin-gated anyway.
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Update a user's status and/or role (admin action; RLS restricts to admins).
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
    },
  });
}
