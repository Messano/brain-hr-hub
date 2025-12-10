import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2, FileText, Building2, User, Banknote } from "lucide-react";
import { toast } from "sonner";
import ContractForm from "@/components/ContractForm";
import ContractHistory from "@/components/ContractHistory";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ContractStatus = "brouillon" | "actif" | "termine" | "annule";
type ContractType = "nouveau" | "modification" | "renouvellement" | "avenant" | "duplicata";
type TrialPeriod = "2_jours" | "3_jours" | "5_jours";

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contract", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          clients:client_id(id, raison_sociale, code, adresse, telephone),
          personnel:personnel_id(id, nom, prenom, matricule, telephone1, qualification)
        `)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const updateData = {
        ...data,
        client_id: data.client_id || null,
        personnel_id: data.personnel_id || null,
      };

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // Get current version number
      const { data: lastHistory } = await supabase
        .from("contract_history")
        .select("version_number")
        .eq("contract_id", id)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      const newVersion = (lastHistory?.version_number || 0) + 1;

      // Calculate changes
      const changes: Record<string, { old: any; new: any }> = {};
      const oldData = contract;
      
      Object.keys(updateData).forEach((key) => {
        if (oldData && oldData[key as keyof typeof oldData] !== updateData[key]) {
          changes[key] = {
            old: oldData[key as keyof typeof oldData],
            new: updateData[key],
          };
        }
      });

      // Update contract
      const { error: updateError } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", id);
      if (updateError) throw updateError;

      // Record history
      const { error: historyError } = await supabase
        .from("contract_history")
        .insert({
          contract_id: id,
          version_number: newVersion,
          changed_by: user.id,
          change_type: Object.keys(changes).includes("status") ? "status_change" : "modification",
          changes,
          snapshot: updateData,
        });
      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract", id] });
      queryClient.invalidateQueries({ queryKey: ["contract-history", id] });
      setIsEditDialogOpen(false);
      toast.success("Contrat mis à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contracts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contrat supprimé avec succès");
      navigate("/admin/contracts");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  if (!contract) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Contrat non trouvé</h2>
        <Button variant="link" onClick={() => navigate("/admin/contracts")}>
          Retour à la liste
        </Button>
      </div>
    );
  }

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

  const getTrialPeriodLabel = (period: TrialPeriod | null) => {
    if (!period) return "-";
    const labels: Record<TrialPeriod, string> = {
      "2_jours": "2 jours",
      "3_jours": "3 jours",
      "5_jours": "5 jours",
    };
    return labels[period] || period;
  };

  const statusConfig = getStatusBadge(contract.status as ContractStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/contracts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{contract.numero_contrat}</h1>
              <Badge variant="outline">{getTypeLabel(contract.type_contrat as ContractType)}</Badge>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
            <p className="text-muted-foreground">Contrat de travail temporaire</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le contrat sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations de base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date de début</p>
                <p className="font-medium">
                  {format(new Date(contract.date_debut), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de fin</p>
                <p className="font-medium">
                  {contract.date_fin 
                    ? format(new Date(contract.date_fin), "dd MMMM yyyy", { locale: fr })
                    : "-"
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date d'entrée en fonction</p>
                <p className="font-medium">
                  {contract.date_entree_fonction 
                    ? format(new Date(contract.date_entree_fonction), "dd MMMM yyyy", { locale: fr })
                    : "-"
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Période d'essai</p>
                <p className="font-medium">{getTrialPeriodLabel(contract.periode_essai as TrialPeriod)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieu de travail</p>
                <p className="font-medium">{contract.lieu_travail || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">N° de commande</p>
                <p className="font-medium">{contract.numero_commande || "-"}</p>
              </div>
            </div>
            {contract.motif_recours && (
              <div>
                <p className="text-sm text-muted-foreground">Motif de recours</p>
                <p className="font-medium">{contract.motif_recours}</p>
              </div>
            )}
            {contract.justificatif && (
              <div>
                <p className="text-sm text-muted-foreground">Justificatif</p>
                <p className="font-medium">{contract.justificatif}</p>
              </div>
            )}
            {contract.caracteristiques_poste && (
              <div>
                <p className="text-sm text-muted-foreground">Caractéristiques du poste</p>
                <p className="font-medium">{contract.caracteristiques_poste}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Informations financières
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Salaire de référence</p>
                <p className="font-medium">{contract.salaire_reference ? `${contract.salaire_reference} DH` : "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux horaire</p>
                <p className="font-medium">{contract.taux_horaire ? `${contract.taux_horaire} DH/h` : "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coefficient de facturation</p>
                <p className="font-medium">{contract.coefficient_facturation || "-"}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Indemnités non soumises</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rubrique</p>
                  <p className="font-medium">{contract.indemnites_non_soumises_rubrique || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-medium">
                    {contract.indemnites_non_soumises_montant ? `${contract.indemnites_non_soumises_montant} DH` : "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {contract.clients && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Raison sociale</p>
                <p className="font-medium">{contract.clients.raison_sociale}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <p className="font-medium">{contract.clients.code}</p>
              </div>
              {contract.clients.adresse && (
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{contract.clients.adresse}</p>
                </div>
              )}
              {contract.clients.telephone && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{contract.clients.telephone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {contract.personnel && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personnel / Intérimaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{contract.personnel.nom} {contract.personnel.prenom}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matricule</p>
                <p className="font-medium">{contract.personnel.matricule}</p>
              </div>
              {contract.personnel.qualification && (
                <div>
                  <p className="text-sm text-muted-foreground">Qualification</p>
                  <p className="font-medium">{contract.personnel.qualification}</p>
                </div>
              )}
              {contract.personnel.telephone1 && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{contract.personnel.telephone1}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ContractHistory contractId={id!} />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le contrat</DialogTitle>
          </DialogHeader>
          <ContractForm
            initialData={{
              type_contrat: contract.type_contrat as any,
              date_debut: contract.date_debut,
              date_fin: contract.date_fin || "",
              date_entree_fonction: contract.date_entree_fonction || "",
              periode_essai: contract.periode_essai as any,
              motif_recours: contract.motif_recours || "",
              justificatif: contract.justificatif || "",
              caracteristiques_poste: contract.caracteristiques_poste || "",
              lieu_travail: contract.lieu_travail || "",
              numero_commande: contract.numero_commande || "",
              salaire_reference: contract.salaire_reference || undefined,
              taux_horaire: contract.taux_horaire || undefined,
              coefficient_facturation: contract.coefficient_facturation || undefined,
              indemnites_non_soumises_rubrique: contract.indemnites_non_soumises_rubrique || "",
              indemnites_non_soumises_montant: contract.indemnites_non_soumises_montant || undefined,
              client_id: contract.client_id || "",
              personnel_id: contract.personnel_id || "",
              status: contract.status as any,
            }}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
