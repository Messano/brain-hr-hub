import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Check, X, Save, Loader2, Eye, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type AppRole = 'super_admin' | 'admin' | 'manager' | 'rh' | 'user';

interface RolePermission {
  id: string;
  role: AppRole;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const MODULES = [
  { key: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { key: 'personnel', label: 'Personnel', icon: '👥' },
  { key: 'clients', label: 'Clients', icon: '🏢' },
  { key: 'contracts', label: 'Contrats', icon: '📄' },
  { key: 'missions', label: 'Missions', icon: '🎯' },
  { key: 'invoices', label: 'Factures', icon: '💰' },
  { key: 'payroll', label: 'Paie', icon: '💵' },
  { key: 'recruitment', label: 'Recrutement', icon: '📋' },
  { key: 'candidates', label: 'Candidatures', icon: '📝' },
  { key: 'training', label: 'Formations', icon: '🎓' },
  { key: 'planning', label: 'Planning', icon: '📅' },
  { key: 'reports', label: 'Rapports', icon: '📈' },
  { key: 'users', label: 'Utilisateurs', icon: '👤' },
  { key: 'audit_logs', label: 'Journal d\'audit', icon: '📋' },
  { key: 'permissions', label: 'Permissions', icon: '🔐' },
  { key: 'settings', label: 'Paramètres', icon: '⚙️' },
];

const ROLES: { key: AppRole; label: string; color: string }[] = [
  { key: 'super_admin', label: 'Super Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { key: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { key: 'manager', label: 'Manager', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { key: 'rh', label: 'RH', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { key: 'user', label: 'Utilisateur', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
];

const PERMISSION_TYPES = [
  { key: 'can_view', label: 'Voir', icon: Eye, shortLabel: 'V' },
  { key: 'can_create', label: 'Créer', icon: Plus, shortLabel: 'C' },
  { key: 'can_edit', label: 'Modifier', icon: Pencil, shortLabel: 'M' },
  { key: 'can_delete', label: 'Supprimer', icon: Trash2, shortLabel: 'S' },
];

export default function RolePermissions() {
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState<Map<string, Partial<RolePermission>>>(new Map());
  const [selectedRole, setSelectedRole] = useState<AppRole | 'all'>('all');

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role')
        .order('module');
      
      if (error) throw error;
      return data as RolePermission[];
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async (updates: { id: string; changes: Partial<RolePermission> }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('role_permissions')
          .update(update.changes)
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      setPendingChanges(new Map());
      toast({
        title: "Permissions mises à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les permissions. Vérifiez vos droits d'accès.",
        variant: "destructive",
      });
      console.error('Error updating permissions:', error);
    },
  });

  const togglePermission = (permissionId: string, field: keyof RolePermission, currentValue: boolean) => {
    const existing = pendingChanges.get(permissionId) || {};
    const newChanges = new Map(pendingChanges);
    newChanges.set(permissionId, { ...existing, [field]: !currentValue });
    setPendingChanges(newChanges);
  };

  const getEffectiveValue = (permission: RolePermission, field: keyof RolePermission): boolean => {
    const pending = pendingChanges.get(permission.id);
    if (pending && field in pending) {
      return pending[field] as boolean;
    }
    return permission[field] as boolean;
  };

  const hasChanges = pendingChanges.size > 0;

  const saveChanges = () => {
    const updates = Array.from(pendingChanges.entries()).map(([id, changes]) => ({
      id,
      changes,
    }));
    updatePermissionMutation.mutate(updates);
  };

  const discardChanges = () => {
    setPendingChanges(new Map());
  };

  const filteredPermissions = permissions?.filter(p => 
    selectedRole === 'all' || p.role === selectedRole
  );

  const getPermissionsByRole = () => {
    if (!filteredPermissions) return {};
    
    return filteredPermissions.reduce((acc, perm) => {
      if (!acc[perm.role]) acc[perm.role] = [];
      acc[perm.role].push(perm);
      return acc;
    }, {} as Record<string, RolePermission[]>);
  };

  const permissionsByRole = getPermissionsByRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Gestion des Permissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Configurez les droits d'accès par rôle pour chaque module de l'application
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={discardChanges}>
              Annuler
            </Button>
            <Button 
              onClick={saveChanges} 
              disabled={updatePermissionMutation.isPending}
              className="flex items-center gap-2"
            >
              {updatePermissionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer ({pendingChanges.size} modification{pendingChanges.size > 1 ? 's' : ''})
            </Button>
          </div>
        )}
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedRole === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedRole('all')}
        >
          Tous les rôles
        </Button>
        {ROLES.map((role) => (
          <Button
            key={role.key}
            variant={selectedRole === role.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRole(role.key)}
          >
            {role.label}
          </Button>
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Légende des permissions</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap gap-4">
            {PERMISSION_TYPES.map((type) => (
              <div key={type.key} className="flex items-center gap-2 text-sm">
                <type.icon className="h-4 w-4 text-muted-foreground" />
                <span>{type.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      {Object.entries(permissionsByRole).map(([role, rolePermissions]) => {
        const roleInfo = ROLES.find(r => r.key === role);
        return (
          <Card key={role}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge className={cn("text-sm px-3 py-1", roleInfo?.color)}>
                  {roleInfo?.label || role}
                </Badge>
                <CardDescription>
                  {role === 'super_admin' && 'Accès complet à toutes les fonctionnalités'}
                  {role === 'admin' && 'Administration complète sauf suppression des paramètres'}
                  {role === 'manager' && 'Gestion opérationnelle des ressources'}
                  {role === 'rh' && 'Gestion des ressources humaines et du personnel'}
                  {role === 'user' && 'Accès en lecture seule aux informations de base'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-sm">Module</th>
                      {PERMISSION_TYPES.map((type) => (
                        <th key={type.key} className="text-center py-2 px-3 font-medium text-sm w-24">
                          <div className="flex flex-col items-center gap-1">
                            <type.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{type.label}</span>
                            <span className="sm:hidden">{type.shortLabel}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((module) => {
                      const permission = rolePermissions.find(p => p.module === module.key);
                      if (!permission) return null;
                      
                      return (
                        <tr key={module.key} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span>{module.icon}</span>
                              <span className="font-medium">{module.label}</span>
                            </div>
                          </td>
                          {PERMISSION_TYPES.map((type) => {
                            const fieldKey = type.key as keyof RolePermission;
                            const isEnabled = getEffectiveValue(permission, fieldKey);
                            const hasChange = pendingChanges.get(permission.id)?.[fieldKey] !== undefined;
                            
                            return (
                              <td key={type.key} className="text-center py-3 px-3">
                                <button
                                  onClick={() => togglePermission(permission.id, fieldKey, isEnabled)}
                                  className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                                    isEnabled 
                                      ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900" 
                                      : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900",
                                    hasChange && "ring-2 ring-primary ring-offset-2"
                                  )}
                                  disabled={role === 'super_admin'} // Super admin always has all permissions
                                  title={role === 'super_admin' ? 'Super Admin a toujours tous les droits' : undefined}
                                >
                                  {isEnabled ? (
                                    <Check className="h-5 w-5" />
                                  ) : (
                                    <X className="h-5 w-5" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">À propos des permissions</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Les modifications sont appliquées immédiatement après enregistrement</li>
                <li>Le rôle Super Admin conserve toujours tous les droits et ne peut pas être modifié</li>
                <li>Les utilisateurs doivent se reconnecter pour voir les changements de permissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
