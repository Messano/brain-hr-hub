import { Plus, Search, Filter, Calendar, MapPin, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";

export default function Missions() {
  const missions = [
    {
      title: "Développement Application Mobile",
      client: "TechCorp",
      contractor: "Marie Dupont",
      status: "active",
      startDate: "15/01/2024",
      endDate: "15/04/2024",
      location: "Paris",
      rate: "450€/jour",
      type: "Intérim"
    },
    {
      title: "Audit Sécurité Informatique", 
      client: "SecureBank",
      contractor: "Jean Martin",
      status: "active",
      startDate: "01/02/2024",
      endDate: "29/02/2024",
      location: "Lyon", 
      rate: "500€/jour",
      type: "Mission"
    },
    {
      title: "Formation React Native",
      client: "StartupXYZ",
      contractor: "Sophie Bernard",
      status: "completed",
      startDate: "10/01/2024",
      endDate: "20/01/2024",
      location: "Remote",
      rate: "400€/jour",
      type: "Formation"
    },
    {
      title: "Refonte Site E-commerce",
      client: "ShopOnline",
      contractor: "Non assigné",
      status: "pending",
      startDate: "01/03/2024",
      endDate: "30/05/2024",
      location: "Marseille",
      rate: "420€/jour",
      type: "Projet"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      case 'completed':
        return <Badge variant="outline">Terminée</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Missions & Contrats</h1>
          <p className="text-muted-foreground">Gérez les missions d'intérim et les contrats</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nouvelle mission</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Missions actives"
          value="18"
          icon={Clock}
          variant="success"
        />
        <KPICard
          title="En attente d'assignation"
          value="5"
          icon={User}
          variant="warning"
        />
        <KPICard
          title="Terminées ce mois"
          value="12"
          change="+3 vs. mois dernier"
          icon={Calendar}
        />
        <KPICard
          title="Chiffre d'affaires"
          value="45,2K€"
          change="+8% ce mois"
          icon={Plus}
          variant="success"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher une mission..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Statut
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Type
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Missions List */}
      <div className="grid gap-4">
        {missions.map((mission, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{mission.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Client: {mission.client}</span>
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {mission.contractor}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {mission.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{mission.type}</Badge>
                  {getStatusBadge(mission.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm">
                  <span className="flex items-center font-medium">
                    <Calendar className="w-3 h-3 mr-1" />
                    {mission.startDate} → {mission.endDate}
                  </span>
                  <span className="font-semibold text-success">
                    {mission.rate}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Voir détails
                  </Button>
                  <Button size="sm">
                    Modifier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}