import { ReactNode } from 'react';
import { usePermissions, PermissionType } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  module: string;
  permission: PermissionType;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ 
  module, 
  permission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) return null;
  
  if (!hasPermission(module, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenience components for common permission checks
export function CanView({ module, children, fallback }: Omit<PermissionGuardProps, 'permission'>) {
  return <PermissionGuard module={module} permission="can_view" fallback={fallback}>{children}</PermissionGuard>;
}

export function CanCreate({ module, children, fallback }: Omit<PermissionGuardProps, 'permission'>) {
  return <PermissionGuard module={module} permission="can_create" fallback={fallback}>{children}</PermissionGuard>;
}

export function CanEdit({ module, children, fallback }: Omit<PermissionGuardProps, 'permission'>) {
  return <PermissionGuard module={module} permission="can_edit" fallback={fallback}>{children}</PermissionGuard>;
}

export function CanDelete({ module, children, fallback }: Omit<PermissionGuardProps, 'permission'>) {
  return <PermissionGuard module={module} permission="can_delete" fallback={fallback}>{children}</PermissionGuard>;
}
