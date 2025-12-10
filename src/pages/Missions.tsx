import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Calendar, MapPin, Clock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MissionForm } from "@/components/MissionForm";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type MissionStatus = Database["public"]["Enums"]["mission_status"];

interface MissionWithRelations {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  mission_type: string | null;
  daily_rate: number | null;
  start_date: string;
  end_date: string | null;
  status: MissionStatus | null;
  contract_url: string | null;
  created_at: string | null;
  client: { raison_sociale: string } | null;
  candidate: { full_name: string } | null;
}

export default function Missions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch missions with client and candidate data
  const { data: missions, isLoading } = useQuery({
    queryKey: ["missions", searchQuery, statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("missions")
        .select(`
          *,
          client:clients(raison_sociale),
          candidate:candidates(full_name)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as MissionStatus);
      }

      if (typeFilter && typeFilter !== "all") {
        query = query.eq("mission_type", typeFilter);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MissionWithRelations[];
    },
  });

  // Fetch KPI data
  const { data: kpiData } = useQuery({
    queryKey: ["missions-kpi"],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [activeResult, pendingResult, completedResult, revenueResult] = await Promise.all([
        supabase.from("missions").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("missions").select("id", { count: "exact" }).eq("status", "pending"),
        supabase
          .from("missions")
          .select("id", { count: "exact" })
          .eq("status", "completed")
          .gte("updated_at", startOfMonth.toISOString()),
        supabase.from("missions").select("daily_rate").eq("status", "active"),
      ]);

      const totalRevenue = revenueResult.data?.reduce((sum, m) => sum + (m.daily_rate || 0), 0) || 0;

      return {
        active: activeResult.count || 0,
        pending: pendingResult.count || 0,
        completedThisMonth: completedResult.count || 0,
        estimatedRevenue: totalRevenue,
      };
    },
  });

  // Create mission mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("missions").insert({
        title: data.title,
        description: data.description || null,
        client_id: data.client_id || null,
        candidate_id: data.candidate_id || null,
        location: data.location || null,
        mission_type: data.mission_type || null,
        daily_rate: data.daily_rate || null,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        end_date: data.end_date ? format(data.end_date, "yyyy-MM-dd") : null,
        status: data.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["missions-kpi"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Mission créée avec succès" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: MissionStatus | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      case "completed":
        return <Badge variant="outline">Terminée</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status || "N/A"}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: fr });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get unique mission types for filter
  const missionTypes = [...new Set(missions?.map((m) => m.mission_type).filter(Boolean) || [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Missions & Contrats</h1>
          <p className="text-muted-foreground">Gérez les missions d'intérim et les contrats</p>
        </div>
        <Button className="flex items-center space-x-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Nouvelle mission</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Missions actives"
          value={kpiData?.active?.toString() || "0"}
          icon={Clock}
          variant="success"
        />
        <KPICard
          title="En attente d'assignation"
          value={kpiData?.pending?.toString() || "0"}
          icon={User}
          variant="warning"
        />
        <KPICard
          title="Terminées ce mois"
          value={kpiData?.completedThisMonth?.toString() || "0"}
          icon={Calendar}
        />
        <KPICard
          title="CA estimé/jour"
          value={formatCurrency(kpiData?.estimatedRevenue || 0)}
          icon={Plus}
          variant="success"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher une mission..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {missionTypes.map((type) => (
                  <SelectItem key={type} value={type!}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Missions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : missions && missions.length > 0 ? (
        <div className="grid gap-4">
          {missions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{mission.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>Client: {mission.client?.raison_sociale || "Non assigné"}</span>
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {mission.candidate?.full_name || "Non assigné"}
                      </span>
                      {mission.location && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {mission.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {mission.mission_type && (
                      <Badge variant="outline">{mission.mission_type}</Badge>
                    )}
                    {getStatusBadge(mission.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="flex items-center font-medium">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(mission.start_date)} → {formatDate(mission.end_date)}
                    </span>
                    {mission.daily_rate && (
                      <span className="font-semibold text-success">
                        {formatCurrency(mission.daily_rate)}/jour
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/missions/${mission.id}`)}
                    >
                      Voir détails
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/admin/missions/${mission.id}`)}
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune mission trouvée</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Aucune mission ne correspond à vos critères de recherche."
                : "Commencez par créer votre première mission."}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle mission
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Mission Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle mission</DialogTitle>
          </DialogHeader>
          <MissionForm
            onSubmit={async (data) => {
              await createMutation.mutateAsync(data);
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
