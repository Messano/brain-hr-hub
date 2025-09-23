import { Plus, Search, Filter, Shield, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KPICard } from "@/components/KPICard";

export default function Users() {
  const users = [
    {
      name: "Marie Dupont",
      email: "marie.dupont@braincrm.com",
      phone: "06 12 34 56 78",
      role: "RH Manager",
      department: "Ressources Humaines", 
      status: "active",
      lastLogin: "Il y a 2h"
    },
    {
      name: "Jean Martin",
      email: "jean.martin@braincrm.com",
      phone: "06 87 65 43 21",
      role: "Développeur Senior",
      department: "IT",
      status: "active", 
      lastLogin: "Il y a 1 jour"
    },
    {
      name: "Sophie Bernard",
      email: "sophie.bernard@braincrm.com",
      phone: "06 55 44 33 22",
      role: "Formatrice",
      department: "Formation",
      status: "active",
      lastLogin: "Il y a 3h"
    },
    {
      name: "Pierre Durand", 
      email: "pierre.durand@braincrm.com",
      phone: "06 99 88 77 66",
      role: "Admin Système",
      department: "IT",
      status: "inactive",
      lastLogin: "Il y a 2 semaines"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Actif</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactif</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    if (role.includes("Admin")) {
      return <Badge variant="destructive">{role}</Badge>;
    } else if (role.includes("Manager")) {
      return <Badge className="bg-warning text-warning-foreground">{role}</Badge>;
    }
    return <Badge variant="outline">{role}</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground">Gestion des comptes utilisateurs et des droits d'accès</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nouvel utilisateur</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Utilisateurs actifs"
          value="142"
          icon={Shield}
          variant="success"
        />
        <KPICard
          title="Administrateurs"
          value="5"
          icon={Shield}
          variant="warning"
        />
        <KPICard
          title="Dernière connexion"
          value="98%"
          change="< 24h"
          icon={Search}
        />
        <KPICard
          title="Nouveaux ce mois"
          value="8"
          change="+3 vs. mois dernier"
          icon={Plus}
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
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Rôle
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Département
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Statut
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {users.map((user, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-muted-foreground">{user.department}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {user.phone}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right space-y-2">
                    <div className="flex space-x-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dernière connexion: {user.lastLogin}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Shield className="w-4 h-4 mr-1" />
                      Droits
                    </Button>
                    <Button size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}