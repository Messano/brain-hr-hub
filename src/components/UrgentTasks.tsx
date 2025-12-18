import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, FileText, Users, Calendar, Clock, Briefcase, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, addDays, isBefore, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface UrgentTask {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  action: () => void;
  actionLabel: string;
}

export function UrgentTasks() {
  const navigate = useNavigate();
  const today = new Date();
  const in7Days = addDays(today, 7);
  const in30Days = addDays(today, 30);

  // Contracts expiring soon
  const { data: expiringContracts, isLoading: loadingContracts } = useQuery({
    queryKey: ['urgent-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('id, date_fin, numero_contrat')
        .eq('status', 'actif')
        .not('date_fin', 'is', null);
      if (error) throw error;
      
      const expiringSoon = data?.filter(c => {
        const endDate = parseISO(c.date_fin!);
        return isBefore(endDate, in30Days);
      }) || [];
      
      const critical = expiringSoon.filter(c => isBefore(parseISO(c.date_fin!), in7Days));
      
      return { total: expiringSoon.length, critical: critical.length };
    }
  });

  // Personnel with expiring documents
  const { data: expiringDocs, isLoading: loadingDocs } = useQuery({
    queryKey: ['urgent-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personnel')
        .select('id, date_validite_document, nom, prenom')
        .eq('is_active', true)
        .not('date_validite_document', 'is', null);
      if (error) throw error;
      
      const expiring = data?.filter(p => {
        const docDate = parseISO(p.date_validite_document!);
        return isBefore(docDate, in30Days);
      }) || [];
      
      const critical = expiring.filter(p => isBefore(parseISO(p.date_validite_document!), in7Days));
      
      return { total: expiring.length, critical: critical.length };
    }
  });

  // New candidates awaiting review
  const { data: pendingCandidates, isLoading: loadingCandidates } = useQuery({
    queryKey: ['urgent-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, status')
        .in('status', ['new', 'reviewing']);
      if (error) throw error;
      return { total: data?.length || 0 };
    }
  });

  // Pending missions
  const { data: pendingMissions, isLoading: loadingMissions } = useQuery({
    queryKey: ['urgent-missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('id, status')
        .eq('status', 'pending');
      if (error) throw error;
      return { total: data?.length || 0 };
    }
  });

  // Draft invoices
  const { data: draftInvoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ['urgent-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, status')
        .eq('status', 'draft');
      if (error) throw error;
      return { total: data?.length || 0 };
    }
  });

  // Overdue invoices
  const { data: overdueInvoices, isLoading: loadingOverdue } = useQuery({
    queryKey: ['urgent-overdue-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, due_date, status')
        .in('status', ['pending', 'sent'])
        .not('due_date', 'is', null);
      if (error) throw error;
      
      const overdue = data?.filter(inv => {
        const dueDate = parseISO(inv.due_date!);
        return isBefore(dueDate, today);
      }) || [];
      
      return { total: overdue.length };
    }
  });

  // Upcoming trainings
  const { data: upcomingTrainings, isLoading: loadingTrainings } = useQuery({
    queryKey: ['urgent-trainings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select('id, start_date, title')
        .eq('status', 'planned');
      if (error) throw error;
      
      const upcoming = data?.filter(t => {
        const startDate = parseISO(t.start_date);
        return isBefore(startDate, in7Days) && !isBefore(startDate, today);
      }) || [];
      
      return { total: upcoming.length };
    }
  });

  const isLoading = loadingContracts || loadingDocs || loadingCandidates || 
                    loadingMissions || loadingInvoices || loadingOverdue || loadingTrainings;

  const tasks: UrgentTask[] = [];

  // Add tasks based on data
  if (expiringContracts?.critical && expiringContracts.critical > 0) {
    tasks.push({
      id: "contracts-critical",
      type: "critical",
      title: "Contrats expirant sous 7 jours",
      description: `${expiringContracts.critical} contrat(s) arrivent à expiration très bientôt`,
      count: expiringContracts.critical,
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/admin/contracts'),
      actionLabel: "Voir les contrats"
    });
  }

  if (expiringContracts?.total && expiringContracts.total > (expiringContracts?.critical || 0)) {
    tasks.push({
      id: "contracts-warning",
      type: "warning",
      title: "Contrats à renouveler",
      description: `${expiringContracts.total - (expiringContracts?.critical || 0)} contrat(s) expirent dans les 30 jours`,
      count: expiringContracts.total - (expiringContracts?.critical || 0),
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/admin/contracts'),
      actionLabel: "Gérer"
    });
  }

  if (expiringDocs?.critical && expiringDocs.critical > 0) {
    tasks.push({
      id: "docs-critical",
      type: "critical",
      title: "Documents expirant sous 7 jours",
      description: `${expiringDocs.critical} document(s) de personnel expirent bientôt`,
      count: expiringDocs.critical,
      icon: <AlertTriangle className="h-4 w-4" />,
      action: () => navigate('/admin/personnel'),
      actionLabel: "Voir le personnel"
    });
  }

  if (expiringDocs?.total && expiringDocs.total > (expiringDocs?.critical || 0)) {
    tasks.push({
      id: "docs-warning",
      type: "warning",
      title: "Documents à renouveler",
      description: `${expiringDocs.total - (expiringDocs?.critical || 0)} document(s) expirent dans les 30 jours`,
      count: expiringDocs.total - (expiringDocs?.critical || 0),
      icon: <Clock className="h-4 w-4" />,
      action: () => navigate('/admin/personnel'),
      actionLabel: "Gérer"
    });
  }

  if (overdueInvoices?.total && overdueInvoices.total > 0) {
    tasks.push({
      id: "invoices-overdue",
      type: "critical",
      title: "Factures en retard",
      description: `${overdueInvoices.total} facture(s) ont dépassé leur date d'échéance`,
      count: overdueInvoices.total,
      icon: <CreditCard className="h-4 w-4" />,
      action: () => navigate('/admin/invoices'),
      actionLabel: "Voir les factures"
    });
  }

  if (pendingCandidates?.total && pendingCandidates.total > 0) {
    tasks.push({
      id: "candidates-pending",
      type: "warning",
      title: "Candidatures à traiter",
      description: `${pendingCandidates.total} candidature(s) en attente de traitement`,
      count: pendingCandidates.total,
      icon: <Users className="h-4 w-4" />,
      action: () => navigate('/admin/candidates'),
      actionLabel: "Traiter"
    });
  }

  if (pendingMissions?.total && pendingMissions.total > 0) {
    tasks.push({
      id: "missions-pending",
      type: "warning",
      title: "Missions en attente",
      description: `${pendingMissions.total} mission(s) à confirmer`,
      count: pendingMissions.total,
      icon: <Briefcase className="h-4 w-4" />,
      action: () => navigate('/admin/missions'),
      actionLabel: "Confirmer"
    });
  }

  if (draftInvoices?.total && draftInvoices.total > 0) {
    tasks.push({
      id: "invoices-draft",
      type: "info",
      title: "Factures brouillon",
      description: `${draftInvoices.total} facture(s) en brouillon à finaliser`,
      count: draftInvoices.total,
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/admin/invoices'),
      actionLabel: "Finaliser"
    });
  }

  if (upcomingTrainings?.total && upcomingTrainings.total > 0) {
    tasks.push({
      id: "trainings-upcoming",
      type: "info",
      title: "Formations à venir",
      description: `${upcomingTrainings.total} formation(s) débutent dans les 7 prochains jours`,
      count: upcomingTrainings.total,
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigate('/admin/training'),
      actionLabel: "Voir"
    });
  }

  const getTypeStyles = (type: UrgentTask["type"]) => {
    switch (type) {
      case "critical":
        return {
          border: "border-destructive/30",
          bg: "bg-destructive/10",
          badge: "destructive" as const,
          badgeText: "Critique"
        };
      case "warning":
        return {
          border: "border-warning/30",
          bg: "bg-warning/10",
          badge: "secondary" as const,
          badgeText: "Attention"
        };
      case "info":
        return {
          border: "border-primary/30",
          bg: "bg-primary/10",
          badge: "outline" as const,
          badgeText: "Info"
        };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Tâches urgentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Tâches urgentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune tâche urgente pour le moment</p>
            <p className="text-sm">Tout est en ordre ! 🎉</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Tâches urgentes
          <Badge variant="destructive" className="ml-2">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map(task => {
          const styles = getTypeStyles(task.type);
          return (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-3 border rounded-lg ${styles.border} ${styles.bg}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{task.icon}</div>
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={styles.badge}>{styles.badgeText}</Badge>
                <Button size="sm" variant="outline" onClick={task.action}>
                  {task.actionLabel}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
