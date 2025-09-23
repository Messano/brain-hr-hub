import { Plus, Search, Filter, Play, BookOpen, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KPICard } from "@/components/KPICard";

export default function Training() {
  const trainings = [
    {
      title: "Formation Sécurité au Travail",
      description: "Sensibilisation aux risques et bonnes pratiques",
      participants: 45,
      completed: 32,
      duration: "2h",
      status: "active",
      mandatory: true
    },
    {
      title: "Développement React Avancé",
      description: "Concepts avancés pour les développeurs React",
      participants: 12,
      completed: 8,
      duration: "16h",
      status: "active",
      mandatory: false
    },
    {
      title: "Management d'Équipe",
      description: "Techniques de leadership et gestion d'équipe",
      participants: 8,
      completed: 8,
      duration: "8h", 
      status: "completed",
      mandatory: false
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'completed':
        return <Badge variant="outline">Terminée</Badge>;
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Formations</h1>
          <p className="text-muted-foreground">Gérez les parcours de formation et le développement des compétences</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nouvelle formation</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Formations actives"
          value="7"
          icon={BookOpen}
          variant="success"
        />
        <KPICard
          title="Participants inscrits"
          value="89"
          change="+12 cette semaine"
          icon={Users}
        />
        <KPICard
          title="Taux de completion"
          value="78%"
          change="+5% vs. mois dernier"
          icon={Play}
          variant="success"
        />
        <KPICard
          title="Heures totales"
          value="456h"
          icon={Clock}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher une formation..."
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

      {/* Trainings List */}
      <div className="grid gap-4">
        {trainings.map((training, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{training.title}</CardTitle>
                    {training.mandatory && (
                      <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{training.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {training.participants} participants
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {training.duration}
                    </span>
                  </div>
                </div>
                {getStatusBadge(training.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{training.completed}/{training.participants} terminés</span>
                  </div>
                  <Progress 
                    value={(training.completed / training.participants) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {Math.round((training.completed / training.participants) * 100)}% de réussite
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-1" />
                      Aperçu
                    </Button>
                    <Button size="sm">
                      Gérer
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