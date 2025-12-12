import { useState, useMemo } from "react";
import { Plus, Search, Filter, Shield, Phone, UserCog, Users as UsersIcon, Crown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KPICard } from "@/components/KPICard";
import { useUsers, UserWithProfile, AppRole } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { UserForm } from "@/components/UserForm";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Users() {
  const { users, isLoading, updateProfile, updateRole, toggleUserStatus, deleteUser } = useUsers();
  const { role: currentUserRole, user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithProfile | null>(null);

  const isSuperAdmin = currentUserRole === 'super_admin';
  const isAdmin = currentUserRole === 'admin' || isSuperAdmin;

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active).length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length
  }), [users]);

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-success text-success-foreground">Actif</Badge>;
    }
    return <Badge variant="outline">Inactif</Badge>;
  };

  const getRoleBadge = (role?: AppRole) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">Super Admin</Badge>;
      case 'admin':
        return <Badge variant="destructive">Administrateur</Badge>;
      case 'manager':
        return <Badge className="bg-warning text-warning-foreground">Manager</Badge>;
      default:
        return <Badge variant="outline">Utilisateur</Badge>;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSaveUser = ({ userId, profile, role }: { userId: string; profile: Partial<UserWithProfile>; role?: AppRole }) => {
    updateProfile.mutate({ userId, data: profile });
    if (role && isSuperAdmin) {
      updateRole.mutate({ userId, role });
    }
  };

  const handleToggleStatus = (user: UserWithProfile) => {
    toggleUserStatus.mutate({ userId: user.user_id, isActive: !user.is_active });
  };

  const handleDeleteUser = () => {
    if (deletingUser) {
      deleteUser.mutate(deletingUser.user_id);
      setDeletingUser(null);
    }
  };

  const canDeleteUser = (user: UserWithProfile) => {
    // Super admin can delete anyone except themselves
    // Admin can delete managers and users, but not admins or super_admins
    if (currentUser?.id === user.user_id) return false;
    if (isSuperAdmin) return true;
    if (isAdmin && (user.role === 'user' || user.role === 'manager')) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground">Gestion des comptes utilisateurs et des droits d'accès</p>
        </div>
        {isSuperAdmin && (
          <Button className="flex items-center space-x-2" disabled>
            <Plus className="w-4 h-4" />
            <span>Inviter un utilisateur</span>
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <KPICard
          title="Total utilisateurs"
          value={stats.total.toString()}
          icon={UsersIcon}
        />
        <KPICard
          title="Utilisateurs actifs"
          value={stats.active.toString()}
          icon={Shield}
          variant="success"
        />
        <KPICard
          title="Super Admins"
          value={stats.superAdmins.toString()}
          icon={Crown}
          variant="warning"
        />
        <KPICard
          title="Administrateurs"
          value={stats.admins.toString()}
          icon={Shield}
          variant="warning"
        />
        <KPICard
          title="Managers"
          value={stats.managers.toString()}
          icon={UserCog}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Rôle {roleFilter !== "all" && `(${roleFilter})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRoleFilter("all")}>Tous</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("super_admin")}>Super Admin</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("admin")}>Administrateur</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("manager")}>Manager</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("user")}>Utilisateur</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Statut {statusFilter !== "all" && `(${statusFilter})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>Tous</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>Actifs</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactifs</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UsersIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{user.full_name || "Sans nom"}</h3>
                        {user.role === 'super_admin' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      {user.department && (
                        <p className="text-muted-foreground">{user.department}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        {user.phone && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone}
                          </span>
                        )}
                        {user.last_login && (
                          <span className="text-xs">
                            Dernière connexion: {new Date(user.last_login).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right space-y-2">
                      <div className="flex space-x-2">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.is_active)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Inscrit le {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.is_active ? "Désactiver" : "Activer"}
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          Modifier
                        </Button>
                        {canDeleteUser(user) && (
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingUser(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {editingUser && (
        <UserForm
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
          canEditRole={isSuperAdmin}
        />
      )}

      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{deletingUser?.full_name || 'Sans nom'}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
