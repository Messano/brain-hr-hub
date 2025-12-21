import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Users, UserCheck, UserX, Filter, Phone, MapPin, Calendar, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import PersonnelForm from "@/components/PersonnelForm";
import { CanCreate } from "@/components/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

type Personnel = {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  civilite: string;
  telephone1: string | null;
  ville: string | null;
  qualification: string | null;
  date_entree: string | null;
  mode_paiement: string | null;
  is_active: boolean | null;
};

const Personnel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { canCreate } = usePermissions();

  const { data: personnel = [], isLoading } = useQuery({
    queryKey: ["personnel", searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("personnel")
        .select("id, matricule, nom, prenom, civilite, telephone1, ville, qualification, date_entree, mode_paiement, is_active")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`nom.ilike.%${searchQuery}%,prenom.ilike.%${searchQuery}%,matricule.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("is_active", statusFilter === "active");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Personnel[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("personnel").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personnel"] });
      setIsFormOpen(false);
      toast.success("Intérimaire créé avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });

  const activeCount = personnel.filter((p) => p.is_active).length;
  const inactiveCount = personnel.filter((p) => !p.is_active).length;

  const getStatusBadge = (isActive: boolean | null) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Actif</Badge>;
    }
    return <Badge variant="secondary">Inactif</Badge>;
  };

  const getCiviliteBadge = (civilite: string) => {
    const colors: Record<string, string> = {
      Mr: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Mle: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      Mme: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    };
    return <Badge className={colors[civilite] || ""}>{civilite}</Badge>;
  };

  const formatPaymentMode = (mode: string | null) => {
    const modes: Record<string, string> = {
      espece: "Espèce",
      cheque: "Chèque",
      virement: "Virement",
    };
    return mode ? modes[mode] || mode : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Personnel / Intérimaires</h1>
          <p className="text-muted-foreground">Gestion des intérimaires et du personnel temporaire</p>
        </div>
        <CanCreate module="personnel">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel intérimaire
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvel intérimaire</DialogTitle>
              </DialogHeader>
              <PersonnelForm
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </CanCreate>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total intérimaires"
          value={personnel.length}
          icon={Users}
        />
        <KPICard
          title="Actifs"
          value={activeCount}
          icon={UserCheck}
          variant="success"
        />
        <KPICard
          title="Inactifs"
          value={inactiveCount}
          icon={UserX}
          variant="warning"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, prénom ou matricule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Personnel List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : personnel.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucun intérimaire trouvé</h3>
            <p className="text-muted-foreground">Commencez par ajouter un nouvel intérimaire.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personnel.map((person) => (
            <Link key={person.id} to={`/admin/personnel/${person.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {getCiviliteBadge(person.civilite)}{" "}
                        <span className="ml-2">{person.prenom} {person.nom}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{person.matricule}</p>
                    </div>
                    {getStatusBadge(person.is_active)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {person.qualification && (
                    <p className="text-sm font-medium text-primary">{person.qualification}</p>
                  )}
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {person.telephone1 && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{person.telephone1}</span>
                      </div>
                    )}
                    {person.ville && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{person.ville}</span>
                      </div>
                    )}
                    {person.date_entree && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Entrée: {new Date(person.date_entree).toLocaleDateString("fr-FR")}</span>
                      </div>
                    )}
                    {person.mode_paiement && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3 w-3" />
                        <span>{formatPaymentMode(person.mode_paiement)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Personnel;
