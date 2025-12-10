import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Plus, Edit, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ContractHistoryProps {
  contractId: string;
}

interface HistoryEntry {
  id: string;
  version_number: number;
  changed_by: string;
  changed_at: string;
  change_type: string;
  changes: any;
  snapshot: any;
}

const fieldLabels: Record<string, string> = {
  type_contrat: "Type de contrat",
  date_debut: "Date de début",
  date_fin: "Date de fin",
  date_entree_fonction: "Date d'entrée en fonction",
  periode_essai: "Période d'essai",
  motif_recours: "Motif de recours",
  justificatif: "Justificatif",
  caracteristiques_poste: "Caractéristiques du poste",
  lieu_travail: "Lieu de travail",
  numero_commande: "N° de commande",
  salaire_reference: "Salaire de référence",
  taux_horaire: "Taux horaire",
  coefficient_facturation: "Coefficient de facturation",
  indemnites_non_soumises_rubrique: "Rubrique indemnités",
  indemnites_non_soumises_montant: "Montant indemnités",
  client_id: "Client",
  personnel_id: "Personnel",
  status: "Statut",
};

export default function ContractHistory({ contractId }: ContractHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["contract-history", contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_history")
        .select("*")
        .eq("contract_id", contractId)
        .order("changed_at", { ascending: false });
      if (error) throw error;
      return data as HistoryEntry[];
    },
  });

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "creation":
        return <Plus className="h-4 w-4" />;
      case "modification":
        return <Edit className="h-4 w-4" />;
      case "status_change":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Edit className="h-4 w-4" />;
    }
  };

  const getChangeBadge = (changeType: string) => {
    switch (changeType) {
      case "creation":
        return <Badge variant="default">Création</Badge>;
      case "modification":
        return <Badge variant="secondary">Modification</Badge>;
      case "status_change":
        return <Badge variant="outline">Changement de statut</Badge>;
      default:
        return <Badge variant="outline">{changeType}</Badge>;
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "boolean") return value ? "Oui" : "Non";
    return String(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des modifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des modifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Aucun historique disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des modifications
          <Badge variant="secondary" className="ml-2">
            {history.length} version{history.length > 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className="relative border-l-2 border-muted pl-4 pb-4 last:pb-0"
              >
                <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  {getChangeIcon(entry.change_type)}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getChangeBadge(entry.change_type)}
                    <span className="text-sm text-muted-foreground">
                      Version {entry.version_number}
                    </span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.changed_at), "dd MMM yyyy à HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>

                  {entry.changes && typeof entry.changes === 'object' && Object.keys(entry.changes).length > 0 && (
                    <div className="bg-muted/50 rounded-md p-3 space-y-2">
                      {Object.entries(entry.changes).map(([field, values]) => {
                        const v = values as { old?: any; new?: any };
                        return (
                          <div key={field} className="text-sm">
                            <span className="font-medium">
                              {fieldLabels[field] || field}:
                            </span>
                            <span className="text-destructive line-through ml-2">
                              {formatValue(v.old)}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="text-primary">
                              {formatValue(v.new)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {entry.change_type === "creation" && (
                    <p className="text-sm text-muted-foreground">
                      Contrat créé
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
