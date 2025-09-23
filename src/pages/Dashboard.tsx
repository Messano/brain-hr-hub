import { Users, UserCheck, Briefcase, BookOpen, TrendingUp, Clock } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const kpiData = [
    {
      title: "Candidatures actives",
      value: 24,
      change: "+12% ce mois",
      icon: Users,
      variant: "success" as const,
    },
    {
      title: "Missions en cours",
      value: 18,
      change: "+3 cette semaine",
      icon: Briefcase,
      variant: "default" as const,
    },
    {
      title: "Formations actives",
      value: 7,
      change: "2 nouvelles",
      icon: BookOpen,
      variant: "warning" as const,
    },
    {
      title: "Employés actifs",
      value: 142,
      change: "+5 ce mois",
      icon: UserCheck,
      variant: "success" as const,
    },
  ];

  const recentActivities = [
    { action: "Nouvelle candidature", candidate: "Marie Dupont", position: "Développeur React", time: "Il y a 2h" },
    { action: "Mission terminée", candidate: "Jean Martin", position: "Consultant IT", time: "Il y a 4h" },
    { action: "Formation complétée", candidate: "Sophie Bernard", position: "Formation Sécurité", time: "Il y a 1j" },
    { action: "Contrat signé", candidate: "Pierre Durand", position: "Chef de projet", time: "Il y a 2j" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité RH</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Activité récente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.candidate} - {activity.position}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Actions rapides</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Créer une offre d'emploi
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Briefcase className="w-4 h-4 mr-2" />
                Nouvelle mission d'intérim
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Planifier une formation
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <UserCheck className="w-4 h-4 mr-2" />
                Ajouter un employé
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Tâches urgentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
              <div>
                <p className="font-medium">Contrats à renouveler</p>
                <p className="text-sm text-muted-foreground">3 contrats expirent dans 7 jours</p>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-warning/20 rounded-lg bg-warning/5">
              <div>
                <p className="font-medium">Formations obligatoires</p>
                <p className="text-sm text-muted-foreground">12 employés doivent compléter leur formation sécurité</p>
              </div>
              <Badge className="bg-warning text-warning-foreground">Attention</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}