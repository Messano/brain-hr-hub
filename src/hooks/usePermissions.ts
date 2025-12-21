import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type PermissionType = 'can_view' | 'can_create' | 'can_edit' | 'can_delete';

interface RolePermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export function usePermissions() {
  const { role, isSuperAdmin } = useAuth();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions', role],
    queryFn: async () => {
      if (!role) return [];
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('module, can_view, can_create, can_edit, can_delete')
        .eq('role', role);
      
      if (error) throw error;
      return data as RolePermission[];
    },
    enabled: !!role,
  });

  const hasPermission = (module: string, permission: PermissionType): boolean => {
    // Super admin always has all permissions
    if (isSuperAdmin) return true;
    
    if (!permissions) return false;
    
    const modulePermission = permissions.find(p => p.module === module);
    if (!modulePermission) return false;
    
    return modulePermission[permission] ?? false;
  };

  const canView = (module: string): boolean => hasPermission(module, 'can_view');
  const canCreate = (module: string): boolean => hasPermission(module, 'can_create');
  const canEdit = (module: string): boolean => hasPermission(module, 'can_edit');
  const canDelete = (module: string): boolean => hasPermission(module, 'can_delete');

  return {
    permissions,
    isLoading,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
}
