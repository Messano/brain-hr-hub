import { Users, UserCheck, Briefcase, BookOpen, TrendingUp, Clock, FileText } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch personnel stats
  const { data: personnelStats, isLoading: loadingPersonnel } = useQuery({
    queryKey: ['dashboard-personnel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personnel')
        .select('is_active');
      if (error) throw error;
      const total = data?.length || 0;
      const active = data?.filter(p => p.is_active).length || 0;
      return { total, active };
    }
  });

  // Fetch missions stats
  const { data: missionsStats, isLoading: loadingMissions } = useQuery({
    queryKey: ['dashboard-missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('status, daily_rate');
      if (error) throw error;
      const total = data?.length || 0;
      const active = data?.filter(m => m.status === 'active').length || 0;
      const pending = data?.filter(m => m.status === 'pending').length || 0;
      const completed = data?.filter(m => m.status === 'completed').length || 0;
      const totalRevenue = data?.reduce((sum, m) => sum + (m.daily_rate || 0) * 22, 0) || 0;
      return { total, active, pending, completed, totalRevenue };
    }
  });

  // Fetch contracts stats
  const { data: contractsStats, isLoading: loadingContracts } = useQuery({
    queryKey: ['dashboard-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('status, is_active');
      if (error) throw error;
      const total = data?.length || 0;
      const active = data?.filter(c => c.status === 'actif').length || 0;
      const draft = data?.filter(c => c.status === 'brouillon').length || 0;
      return { total, active, draft };
    }
  });

  // Fetch candidates stats
  const { data: candidatesStats, isLoading: loadingCandidates } = useQuery({
    queryKey: ['dashboard-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('status');
      if (error) throw error;
      const total = data?.length || 0;
      const newCandidates = data?.filter(c => c.status === 'new').length || 0;
      const inInterview = data?.filter(c => c.status === 'interview').length || 0;
      return { total, newCandidates, inInterview };
    }
  });

  const isLoading = loadingPersonnel || loadingMissions || loadingContracts || loadingCandidates;

  const kpiData = [
    {
      title: "Candidatures actives",
      value: candidatesStats?.total || 0,
      change: `${candidatesStats?.newCandidates || 0} nouvelles`,
      icon: Users,
      variant: "success" as const,
    },
    {
      title: "Missions en cours",
      value: missionsStats?.active || 0,
      change: `${missionsStats?.pending || 0} en attente`,
      icon: Briefcase,
      variant: "default" as const,
    },
    {
      title: "Contrats actifs",
      value: contractsStats?.active || 0,
      change: `${contractsStats?.draft || 0} brouillons`,
      icon: FileText,
      variant: "warning" as const,
    },
    {
      title: "Personnel actif",
      value: personnelStats?.active || 0,
      change: `${personnelStats?.total || 0} au total`,
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité RH</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))
        )}
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chiffre d'affaires estimé</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(missionsStats?.totalRevenue || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Basé sur les missions actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Missions terminées</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{missionsStats?.completed || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Depuis le début</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entretiens planifiés</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{candidatesStats?.inInterview || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Candidats en entretien</p>
          </CardContent>
        </Card>
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
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/recruitment/new')}>
                <Users className="w-4 h-4 mr-2" />
                Créer une offre d'emploi
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/missions')}>
                <Briefcase className="w-4 h-4 mr-2" />
                Nouvelle mission d'intérim
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/training')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Planifier une formation
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/personnel')}>
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
                <p className="text-sm text-muted-foreground">{contractsStats?.draft || 0} contrats en brouillon à finaliser</p>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-warning/20 rounded-lg bg-warning/5">
              <div>
                <p className="font-medium">Missions en attente</p>
                <p className="text-sm text-muted-foreground">{missionsStats?.pending || 0} missions à confirmer</p>
              </div>
              <Badge className="bg-warning text-warning-foreground">Attention</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
