import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ requireAdmin = false, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isAdmin, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If specific roles are required, check them
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = role && allowedRoles.includes(role);
    const isSuperAdminUser = isSuperAdmin; // Super admin always has access
    
    if (!hasRequiredRole && !isSuperAdminUser) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Accès refusé</h1>
            <p className="text-muted-foreground mt-2">
              Vous n'avez pas les droits d'accès à cette section.
            </p>
          </div>
        </div>
      );
    }
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Accès refusé</h1>
          <p className="text-muted-foreground mt-2">
            Vous n'avez pas les droits d'accès à cette section.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
