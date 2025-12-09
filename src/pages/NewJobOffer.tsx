import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Liste des clients (à remplacer par des données de la base de données)
const clients = [
  { id: "CLI001", name: "TechCorp Solutions", type: "C1" },
  { id: "CLI002", name: "Innovation Labs", type: "C2" },
  { id: "CLI003", name: "Digital Services SARL", type: "C1" },
  { id: "CLI004", name: "Consulting Pro SA", type: "C9" },
  { id: "CLI005", name: "MarocTech Industries", type: "C2" },
];

export default function NewJobOffer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Offre créée",
      description: "L'offre d'emploi a été créée avec succès.",
    });
    navigate("/admin/recruitment");
  };

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
            <h1 className="text-3xl font-bold">Nouvelle offre d'emploi</h1>
            <p className="text-muted-foreground">Créez une nouvelle offre de recrutement</p>
          </div>
        </div>
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
                  Client *
                </Label>
                <Select value={selectedClient} onValueChange={setSelectedClient} required>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{client.name}</span>
                          <span className="text-muted-foreground text-xs">({client.id} - {client.type})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Le client qui a émis cette offre d'emploi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre du poste *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Développeur React Senior"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Département *</Label>
                  <Select required>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="rh">Ressources Humaines</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type de contrat *</Label>
                  <Select required>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cdi">CDI</SelectItem>
                      <SelectItem value="cdd">CDD</SelectItem>
                      <SelectItem value="mission">Mission</SelectItem>
                      <SelectItem value="stage">Stage</SelectItem>
                      <SelectItem value="alternance">Alternance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Paris, Lyon..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salaire</Label>
                  <Input
                    id="salary"
                    placeholder="Ex: 45-55K€"
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
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez le poste, les responsabilités, l'environnement de travail..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Compétences requises *</Label>
                <Textarea
                  id="requirements"
                  placeholder="Listez les compétences et qualifications nécessaires..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Avantages</Label>
                <Textarea
                  id="benefits"
                  placeholder="Télétravail, tickets restaurant, mutuelle..."
                  rows={3}
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
                <Select defaultValue="draft">
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Publier immédiatement</SelectItem>
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
            <Button type="submit" className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Créer l'offre</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
