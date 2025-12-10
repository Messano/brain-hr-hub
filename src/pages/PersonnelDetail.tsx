import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2, User, Phone, MapPin, Calendar, CreditCard, FileText, Briefcase } from "lucide-react";
import PersonnelForm from "@/components/PersonnelForm";

const PersonnelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: person, isLoading } = useQuery({
    queryKey: ["personnel", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personnel")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("personnel")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personnel", id] });
      queryClient.invalidateQueries({ queryKey: ["personnel"] });
      setIsEditOpen(false);
      toast.success("Intérimaire mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("personnel").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Intérimaire supprimé avec succès");
      navigate("/admin/personnel");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin/personnel")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Intérimaire non trouvé</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const formatSituationFamiliale = (situation: string | null) => {
    const situations: Record<string, string> = {
      C: "Célibataire",
      M: "Marié(e)",
      D: "Divorcé(e)",
    };
    return situation ? situations[situation] || situation : "-";
  };

  const formatPaymentMode = (mode: string | null) => {
    const modes: Record<string, string> = {
      espece: "Espèce",
      cheque: "Chèque",
      virement: "Virement",
    };
    return mode ? modes[mode] || mode : "-";
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/personnel")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <div className="flex items-center gap-2">
              {getCiviliteBadge(person.civilite)}
              <h1 className="text-3xl font-bold text-foreground">
                {person.prenom} {person.nom}
              </h1>
              {getStatusBadge(person.is_active)}
            </div>
            <p className="text-muted-foreground font-mono">{person.matricule}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Modifier l'intérimaire</DialogTitle>
              </DialogHeader>
              <PersonnelForm
                defaultValues={{
                  ...person,
                  date_naissance: person.date_naissance || undefined,
                  date_entree: person.date_entree || undefined,
                  date_fin_mission: person.date_fin_mission || undefined,
                  date_premiere_paie: person.date_premiere_paie || undefined,
                  date_validite_document: person.date_validite_document || undefined,
                }}
                onSubmit={(data) => updateMutation.mutate(data)}
                isLoading={updateMutation.isPending}
              />
            </DialogContent>
          </Dialog>
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
                  Êtes-vous sûr de vouloir supprimer cet intérimaire ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{person.civilite} {person.prenom} {person.nom}</p>
              </div>
              {person.nom_jeune_fille && (
                <div>
                  <p className="text-sm text-muted-foreground">Nom de jeune fille</p>
                  <p className="font-medium">{person.nom_jeune_fille}</p>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Adresse
              </p>
              <p className="font-medium">
                {person.adresse || "-"}
                {person.complement_adresse && <><br />{person.complement_adresse}</>}
                {(person.code_postal || person.ville) && (
                  <><br />{person.code_postal} {person.ville}</>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Téléphone 1
                </p>
                <p className="font-medium">{person.telephone1 || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Téléphone 2
                </p>
                <p className="font-medium">{person.telephone2 || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date de naissance
                </p>
                <p className="font-medium">{formatDate(person.date_naissance)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nationalité</p>
                <p className="font-medium">{person.nationalite || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Situation familiale</p>
                <p className="font-medium">{formatSituationFamiliale(person.situation_familiale)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations administratives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations administratives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type de document</p>
                <p className="font-medium">{person.type_document || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Numéro</p>
                <p className="font-medium">{person.numero_document || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de validité</p>
                <p className="font-medium">{formatDate(person.date_validite_document)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Qualification
              </p>
              <p className="font-medium">{person.qualification || "-"}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date d'entrée</p>
                <p className="font-medium">{formatDate(person.date_entree)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date fin de mission</p>
                <p className="font-medium">{formatDate(person.date_fin_mission)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date 1ère paie</p>
                <p className="font-medium">{formatDate(person.date_premiere_paie)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations de paiement */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informations de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mode de paiement</p>
                <p className="font-medium">{formatPaymentMode(person.mode_paiement)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RIB</p>
                <p className="font-medium font-mono">{person.rib || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Domiciliation bancaire</p>
                <p className="font-medium">{person.domiciliation_bancaire || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonnelDetail;
