import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Building2,
  FileText,
  Edit,
  Trash2,
  Loader2,
  Download,
  Euro,
  FileSignature,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { MissionForm } from "@/components/MissionForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

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
  updated_at: string | null;
  client_id: string | null;
  candidate_id: string | null;
  personnel_id: string | null;
  client: { id: string; raison_sociale: string; contact_nom: string | null; contact_email: string | null } | null;
  candidate: { id: string; full_name: string; email: string; phone: string | null } | null;
  personnel: { id: string; matricule: string; nom: string; prenom: string; civilite: string } | null;
}

export default function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: mission, isLoading, error } = useQuery({
    queryKey: ["mission", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select(`
          *,
          client:clients(id, raison_sociale, contact_nom, contact_email),
          candidate:candidates(id, full_name, email, phone),
          personnel:personnel(id, matricule, nom, prenom, civilite)
        `)
        .eq("id", id!)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Mission non trouvée");
      return data as MissionWithRelations;
    },
    enabled: !!id,
  });

  const { data: contracts } = useQuery({
    queryKey: ["mission-contracts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, clients(raison_sociale), personnel(nom, prenom)")
        .eq("mission_id", id)
        .order("date_debut", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("missions")
        .update({
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
        })
        .eq("id", id!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mission", id] });
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      setIsEditDialogOpen(false);
      toast({ title: "Mission mise à jour avec succès" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("missions").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      toast({ title: "Mission supprimée avec succès" });
      navigate("/admin/missions");
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
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin/missions")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux missions
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Mission non trouvée</h3>
            <p className="text-muted-foreground">
              Cette mission n'existe pas ou a été supprimée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/missions")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{mission.title}</h1>
              {getStatusBadge(mission.status)}
              {mission.mission_type && (
                <Badge variant="outline">{mission.mission_type}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Créée le {formatDate(mission.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette mission ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. La mission sera définitivement
                  supprimée.
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Détails de la mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Période</p>
                  <p className="font-medium">
                    {formatDate(mission.start_date)} → {formatDate(mission.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Localisation</p>
                  <p className="font-medium">{mission.location || "Non spécifiée"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Euro className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Tarif journalier</p>
                  <p className="font-medium text-success">
                    {formatCurrency(mission.daily_rate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Contrat</p>
                  {mission.contract_url ? (
                    <a
                      href={mission.contract_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </a>
                  ) : (
                    <p className="font-medium text-muted-foreground">Non disponible</p>
                  )}
                </div>
              </div>
            </div>

            {mission.description && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {mission.description}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mission.client ? (
                <div className="space-y-2">
                  <p className="font-medium">{mission.client.raison_sociale}</p>
                  {mission.client.contact_nom && (
                    <p className="text-sm text-muted-foreground">
                      Contact: {mission.client.contact_nom}
                    </p>
                  )}
                  {mission.client.contact_email && (
                    <a
                      href={`mailto:${mission.client.contact_email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {mission.client.contact_email}
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun client assigné</p>
              )}
            </CardContent>
          </Card>

          {/* Candidate Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Candidat
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mission.candidate ? (
                <div className="space-y-2">
                  <p className="font-medium">{mission.candidate.full_name}</p>
                  <a
                    href={`mailto:${mission.candidate.email}`}
                    className="text-sm text-primary hover:underline block"
                  >
                    {mission.candidate.email}
                  </a>
                  {mission.candidate.phone && (
                    <p className="text-sm text-muted-foreground">
                      Tél: {mission.candidate.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun candidat assigné</p>
              )}
            </CardContent>
          </Card>

          {/* Personnel Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personnel / Intérimaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mission.personnel ? (
                <div className="space-y-2">
                  <p className="font-medium">
                    {mission.personnel.civilite} {mission.personnel.prenom} {mission.personnel.nom}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {mission.personnel.matricule}
                  </p>
                  <Link to={`/admin/personnel/${mission.personnel.id}`}>
                    <Button variant="outline" size="sm" className="mt-2">
                      Voir le profil
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun personnel assigné</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contrats associés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Contrats CTT associés ({contracts?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contracts && contracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Contrat</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Personnel</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date début</TableHead>
                  <TableHead>Date fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract: any) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono font-medium">{contract.numero_contrat}</TableCell>
                    <TableCell>{contract.type_contrat}</TableCell>
                    <TableCell>
                      {contract.personnel 
                        ? `${contract.personnel.prenom} ${contract.personnel.nom}` 
                        : "-"}
                    </TableCell>
                    <TableCell>{contract.clients?.raison_sociale || "-"}</TableCell>
                    <TableCell>{formatDate(contract.date_debut)}</TableCell>
                    <TableCell>{formatDate(contract.date_fin)}</TableCell>
                    <TableCell>
                      <Badge variant={contract.status === "actif" ? "default" : "secondary"}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/contracts/${contract.id}`}>
                        <Button variant="ghost" size="sm">Voir</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">Aucun contrat associé à cette mission</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la mission</DialogTitle>
          </DialogHeader>
          <MissionForm
            mission={mission}
            onSubmit={async (data) => {
              await updateMutation.mutateAsync(data);
            }}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
