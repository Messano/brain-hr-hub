import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Search, Calendar, Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { KPICard } from "@/components/KPICard";
import ContractForm from "@/components/ContractForm";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ContractStatus = "brouillon" | "actif" | "termine" | "annule";
type ContractType = "nouveau" | "modification" | "renouvellement" | "avenant" | "duplicata";

export default function Contracts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          clients:client_id(id, raison_sociale, code),
          personnel:personnel_id(id, nom, prenom, matricule)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const insertData = {
        ...data,
        client_id: data.client_id || null,
        personnel_id: data.personnel_id || null,
      };
      const { error } = await supabase.from("contracts").insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setIsDialogOpen(false);
      toast.success("Contrat créé avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });

  const filteredContracts = contracts?.filter((contract) => {
    const matchesSearch =
      contract.numero_contrat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.clients?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.personnel?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ContractStatus) => {
    const config: Record<ContractStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      brouillon: { label: "Brouillon", variant: "secondary" },
      actif: { label: "Actif", variant: "default" },
      termine: { label: "Terminé", variant: "outline" },
      annule: { label: "Annulé", variant: "destructive" },
    };
    return config[status] || { label: status, variant: "outline" };
  };

  const getTypeLabel = (type: ContractType) => {
    const labels: Record<ContractType, string> = {
      nouveau: "Nouveau",
      modification: "Modification",
      renouvellement: "Renouvellement",
      avenant: "Avenant",
      duplicata: "Duplicata",
    };
    return labels[type] || type;
  };

  const stats = {
    total: contracts?.length || 0,
    actifs: contracts?.filter((c) => c.status === "actif").length || 0,
    brouillons: contracts?.filter((c) => c.status === "brouillon").length || 0,
    termines: contracts?.filter((c) => c.status === "termine").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contrats de Travail Temporaire</h1>
          <p className="text-muted-foreground">Gestion des CTT</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau contrat
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total contrats"
          value={stats.total}
          icon={FileText}
        />
        <KPICard
          title="Contrats actifs"
          value={stats.actifs}
          icon={FileText}
        />
        <KPICard
          title="Brouillons"
          value={stats.brouillons}
          icon={FileText}
        />
        <KPICard
          title="Terminés"
          value={stats.termines}
          icon={FileText}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contrat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="termine">Terminé</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : filteredContracts?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun contrat trouvé
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContracts?.map((contract) => {
                const statusConfig = getStatusBadge(contract.status as ContractStatus);
                return (
                  <div
                    key={contract.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors gap-3"
                    onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{contract.numero_contrat}</span>
                        <Badge variant="outline">{getTypeLabel(contract.type_contrat as ContractType)}</Badge>
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {contract.clients && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {contract.clients.raison_sociale}
                          </span>
                        )}
                        {contract.personnel && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {contract.personnel.nom} {contract.personnel.prenom}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(contract.date_debut), "dd MMM yyyy", { locale: fr })}
                          {contract.date_fin && ` - ${format(new Date(contract.date_fin), "dd MMM yyyy", { locale: fr })}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {contract.taux_horaire && (
                        <div className="font-medium">{contract.taux_horaire} DH/h</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau contrat de travail temporaire</DialogTitle>
          </DialogHeader>
          <ContractForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
