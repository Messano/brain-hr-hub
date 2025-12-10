import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Building2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
import type { Tables, Database } from "@/integrations/supabase/types";

type Client = Tables<"clients">;
type JobOffer = Tables<"job_offers">;
type JobType = Database["public"]["Enums"]["job_type"];
type JobStatus = Database["public"]["Enums"]["job_status"];

export default function EditJobOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    client_id: "",
    department: "",
    job_type: "" as JobType | "",
    location: "",
    salary_min: "",
    salary_max: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    status: "draft" as JobStatus,
  });

  useEffect(() => {
    if (id) {
      fetchJobOffer();
      fetchClients();
    }
  }, [id]);

  const fetchJobOffer = async () => {
    try {
      const { data, error } = await supabase
        .from("job_offers")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: "Offre introuvable",
          description: "Cette offre n'existe pas.",
          variant: "destructive",
        });
        navigate("/admin/recruitment");
        return;
      }

      setFormData({
        title: data.title,
        client_id: data.client_id || "",
        department: data.department || "",
        job_type: data.job_type || "",
        location: data.location || "",
        salary_min: data.salary_min?.toString() || "",
        salary_max: data.salary_max?.toString() || "",
        description: data.description || "",
        requirements: data.requirements?.join("\n") || "",
        responsibilities: data.responsibilities?.join("\n") || "",
        benefits: data.benefits?.join("\n") || "",
        status: data.status || "draft",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'offre.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("is_active", true)
      .order("raison_sociale");

    if (!error && data) {
      setClients(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const wasActive = formData.status === "active";
      
      const updateData = {
        title: formData.title,
        client_id: formData.client_id || null,
        department: formData.department || null,
        job_type: (formData.job_type || "cdi") as JobType,
        location: formData.location || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        description: formData.description || null,
        requirements: formData.requirements ? formData.requirements.split("\n").filter(Boolean) : null,
        responsibilities: formData.responsibilities ? formData.responsibilities.split("\n").filter(Boolean) : null,
        benefits: formData.benefits ? formData.benefits.split("\n").filter(Boolean) : null,
        status: formData.status,
        published_at: formData.status === "active" && !wasActive ? new Date().toISOString() : undefined,
      };

      const { error } = await supabase
        .from("job_offers")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Offre mise à jour",
        description: "Les modifications ont été enregistrées.",
      });
      navigate("/admin/recruitment");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'offre.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from("job_offers").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Offre supprimée",
        description: "L'offre a été supprimée avec succès.",
      });
      navigate("/admin/recruitment");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'offre.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/recruitment")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Modifier l'offre</h1>
            <p className="text-muted-foreground">Modifiez les détails de l'offre d'emploi</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sélecteur de client */}
              <div className="space-y-2">
                <Label htmlFor="client" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Client
                </Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Sélectionner un client (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{client.raison_sociale}</span>
                          <span className="text-muted-foreground text-xs">({client.code})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre du poste *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Développeur React Senior"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="RH">Ressources Humaines</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="Logistique">Logistique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type de contrat *</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => setFormData({ ...formData, job_type: value as JobType })}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cdi">CDI</SelectItem>
                      <SelectItem value="cdd">CDD</SelectItem>
                      <SelectItem value="interim">Intérim</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="stage">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Paris, Lyon..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_min">Salaire min (€)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    placeholder="Ex: 35000"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_max">Salaire max (€)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    placeholder="Ex: 45000"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description du poste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez le poste, les responsabilités, l'environnement de travail..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsabilités (une par ligne)</Label>
                <Textarea
                  id="responsibilities"
                  placeholder="Développer et maintenir des applications&#10;Collaborer avec l'équipe produit&#10;Participer aux revues de code"
                  rows={4}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Compétences requises (une par ligne)</Label>
                <Textarea
                  id="requirements"
                  placeholder="5+ ans d'expérience&#10;Maîtrise de TypeScript&#10;Connaissance des tests unitaires"
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Avantages (un par ligne)</Label>
                <Textarea
                  id="benefits"
                  placeholder="Télétravail flexible&#10;Tickets restaurant&#10;Mutuelle d'entreprise"
                  rows={3}
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as JobStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Active (publiée)</SelectItem>
                    <SelectItem value="closed">Fermée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/recruitment")}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex items-center space-x-2" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Enregistrement..." : "Enregistrer"}</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
