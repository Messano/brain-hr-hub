import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AppRole = 'super_admin' | 'admin' | 'manager' | 'rh' | 'user';

export interface UserWithProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  phone: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string | null;
  email?: string;
  role?: AppRole;
}

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = profiles.map(profile => ({
        ...profile,
        role: roles.find(r => r.user_id === profile.user_id)?.role as AppRole | undefined
      }));

      return usersWithRoles as UserWithProfile[];
    }
  });

  const updateProfile = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<UserWithProfile> }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          department: data.department,
          phone: data.phone,
          is_active: data.is_active
        })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Profil mis à jour avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message);
    }
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // First check if role exists
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Rôle mis à jour avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour du rôle: ' + error.message);
    }
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Statut mis à jour avec succès');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // Delete user role first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression: ' + error.message);
    }
  });

  return {
    users,
    isLoading,
    error,
    updateProfile,
    updateRole,
    toggleUserStatus,
    deleteUser
  };
}
