import { useState } from "react";
import { Building2, Plus, Search, Eye, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Client {
  id: string;
  code: string;
  raisonSociale: string;
  titre: "SA" | "SOC" | "SARL";
  adresse: string;
  adresseFacturation: string;
  telephone: string;
  email: string;
  modeReglement: "Chèque" | "Traite" | "Virement";
  delaiReglement: number;
  codeComptable: string;
  typeClient: "C1" | "C2" | "C9";
  facturationCP: boolean;
  codeICE: string;
  coeffHeuresNormales: number;
  coeffHS25: number;
  coeffHS50: number;
  coeffHS100: number;
  coeffHeuresFeriees: number;
  coeffIndemniteSoumise: number;
  coeffIndemniteNonSoumise: number;
  coeffCP: number;
  coeffPrime: number;
  dureeHebdo: number;
  horaires: string;
  activationSTC: boolean;
  tva: "Normale" | "Exonérée" | "Réduite";
  modeEditionFacture: "Global" | "Salarié" | "Commande";
  nomContact: string;
  codeCommercial: string;
  status: "Actif" | "Inactif";
}

const mockClients: Client[] = [
  {
    id: "1",
    code: "CLI-001",
    raisonSociale: "TechCorp Solutions",
    titre: "SA",
    adresse: "123 Avenue Mohammed V, Casablanca",
    adresseFacturation: "123 Avenue Mohammed V, Casablanca",
    telephone: "+212 522 123 456",
    email: "contact@techcorp.ma",
    modeReglement: "Virement",
    delaiReglement: 30,
    codeComptable: "411001",
    typeClient: "C1",
    facturationCP: true,
    codeICE: "001234567000089",
    coeffHeuresNormales: 1.0,
    coeffHS25: 1.25,
    coeffHS50: 1.50,
    coeffHS100: 2.0,
    coeffHeuresFeriees: 2.0,
    coeffIndemniteSoumise: 1.0,
    coeffIndemniteNonSoumise: 1.0,
    coeffCP: 1.1,
    coeffPrime: 1.0,
    dureeHebdo: 44,
    horaires: "08:00 - 17:00",
    activationSTC: true,
    tva: "Normale",
    modeEditionFacture: "Salarié",
    nomContact: "Ahmed Benali",
    codeCommercial: "COM-001",
    status: "Actif",
  },
  {
    id: "2",
    code: "CLI-002",
    raisonSociale: "Industries Maroc",
    titre: "SARL",
    adresse: "45 Rue Al Fida, Rabat",
    adresseFacturation: "BP 456, Rabat",
    telephone: "+212 537 654 321",
    email: "rh@industries-maroc.ma",
    modeReglement: "Chèque",
    delaiReglement: 60,
    codeComptable: "411002",
    typeClient: "C2",
    facturationCP: false,
    codeICE: "002345678000090",
    coeffHeuresNormales: 1.0,
    coeffHS25: 1.25,
    coeffHS50: 1.50,
    coeffHS100: 2.0,
    coeffHeuresFeriees: 2.0,
    coeffIndemniteSoumise: 1.0,
    coeffIndemniteNonSoumise: 1.0,
    coeffCP: 1.0,
    coeffPrime: 1.0,
    dureeHebdo: 44,
    horaires: "07:00 - 16:00",
    activationSTC: false,
    tva: "Exonérée",
    modeEditionFacture: "Global",
    nomContact: "Fatima Zahra El Amrani",
    codeCommercial: "COM-002",
    status: "Actif",
  },
  {
    id: "3",
    code: "CLI-003",
    raisonSociale: "Services Plus",
    titre: "SOC",
    adresse: "78 Boulevard Zerktouni, Marrakech",
    adresseFacturation: "78 Boulevard Zerktouni, Marrakech",
    telephone: "+212 524 789 012",
    email: "direction@servicesplus.ma",
    modeReglement: "Traite",
    delaiReglement: 90,
    codeComptable: "411003",
    typeClient: "C9",
    facturationCP: true,
    codeICE: "003456789000091",
    coeffHeuresNormales: 1.0,
    coeffHS25: 1.25,
    coeffHS50: 1.50,
    coeffHS100: 2.0,
    coeffHeuresFeriees: 2.0,
    coeffIndemniteSoumise: 1.0,
    coeffIndemniteNonSoumise: 1.0,
    coeffCP: 1.15,
    coeffPrime: 1.05,
    dureeHebdo: 40,
    horaires: "09:00 - 18:00",
    activationSTC: true,
    tva: "Réduite",
    modeEditionFacture: "Commande",
    nomContact: "Karim Tazi",
    codeCommercial: "COM-001",
    status: "Inactif",
  },
];

const emptyClient: Omit<Client, "id" | "code"> = {
  raisonSociale: "",
  titre: "SA",
  adresse: "",
  adresseFacturation: "",
  telephone: "",
  email: "",
  modeReglement: "Virement",
  delaiReglement: 30,
  codeComptable: "",
  typeClient: "C1",
  facturationCP: false,
  codeICE: "",
  coeffHeuresNormales: 1.0,
  coeffHS25: 1.25,
  coeffHS50: 1.50,
  coeffHS100: 2.0,
  coeffHeuresFeriees: 2.0,
  coeffIndemniteSoumise: 1.0,
  coeffIndemniteNonSoumise: 1.0,
  coeffCP: 1.0,
  coeffPrime: 1.0,
  dureeHebdo: 44,
  horaires: "",
  activationSTC: false,
  tva: "Normale",
  modeEditionFacture: "Global",
  nomContact: "",
  codeCommercial: "",
  status: "Actif",
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Omit<Client, "id" | "code">>(emptyClient);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesType = typeFilter === "all" || client.typeClient === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddClient = () => {
    const newCode = `CLI-${String(clients.length + 1).padStart(3, "0")}`;
    const clientToAdd: Client = {
      ...newClient,
      id: String(clients.length + 1),
      code: newCode,
    };
    setClients([...clients, clientToAdd]);
    setNewClient(emptyClient);
    setIsAddDialogOpen(false);
    toast.success("Client ajouté avec succès");
  };

  const handleEditClient = () => {
    if (!selectedClient) return;
    setClients(clients.map((c) => (c.id === selectedClient.id ? selectedClient : c)));
    setIsEditDialogOpen(false);
    toast.success("Client modifié avec succès");
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    toast.success("Client supprimé avec succès");
  };

  const ClientForm = ({
    client,
    setClient,
    isEdit = false,
  }: {
    client: Omit<Client, "id" | "code"> | Client;
    setClient: (client: any) => void;
    isEdit?: boolean;
  }) => (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="facturation">Facturation</TabsTrigger>
        <TabsTrigger value="coefficients">Coefficients</TabsTrigger>
        <TabsTrigger value="travail">Travail</TabsTrigger>
        <TabsTrigger value="systeme">Système</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Raison Sociale *</Label>
            <Input
              value={client.raisonSociale}
              onChange={(e) => setClient({ ...client, raisonSociale: e.target.value })}
              placeholder="Nom de la société"
            />
          </div>
          <div className="space-y-2">
            <Label>Titre *</Label>
            <Select
              value={client.titre}
              onValueChange={(value: "SA" | "SOC" | "SARL") =>
                setClient({ ...client, titre: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SA">SA</SelectItem>
                <SelectItem value="SOC">SOC</SelectItem>
                <SelectItem value="SARL">SARL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Adresse *</Label>
            <Input
              value={client.adresse}
              onChange={(e) => setClient({ ...client, adresse: e.target.value })}
              placeholder="Adresse complète"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Adresse de facturation</Label>
            <Input
              value={client.adresseFacturation}
              onChange={(e) => setClient({ ...client, adresseFacturation: e.target.value })}
              placeholder="Si différente de l'adresse principale"
            />
          </div>
          <div className="space-y-2">
            <Label>Téléphone *</Label>
            <Input
              value={client.telephone}
              onChange={(e) => setClient({ ...client, telephone: e.target.value })}
              placeholder="+212 5XX XXX XXX"
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail *</Label>
            <Input
              type="email"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
              placeholder="contact@societe.ma"
            />
          </div>
          <div className="space-y-2">
            <Label>Nom du contact *</Label>
            <Input
              value={client.nomContact}
              onChange={(e) => setClient({ ...client, nomContact: e.target.value })}
              placeholder="Responsable du site"
            />
          </div>
          <div className="space-y-2">
            <Label>Code commercial</Label>
            <Input
              value={client.codeCommercial}
              onChange={(e) => setClient({ ...client, codeCommercial: e.target.value })}
              placeholder="COM-XXX"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="facturation" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Mode de règlement</Label>
            <Select
              value={client.modeReglement}
              onValueChange={(value: "Chèque" | "Traite" | "Virement") =>
                setClient({ ...client, modeReglement: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chèque">Chèque</SelectItem>
                <SelectItem value="Traite">Traite</SelectItem>
                <SelectItem value="Virement">Virement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Délai de règlement (jours)</Label>
            <Select
              value={String(client.delaiReglement)}
              onValueChange={(value) =>
                setClient({ ...client, delaiReglement: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
                <SelectItem value="120">120 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Code comptable (R.Cpt)</Label>
            <Input
              value={client.codeComptable}
              onChange={(e) => setClient({ ...client, codeComptable: e.target.value })}
              placeholder="411XXX"
            />
          </div>
          <div className="space-y-2">
            <Label>Type de client</Label>
            <Select
              value={client.typeClient}
              onValueChange={(value: "C1" | "C2" | "C9") =>
                setClient({ ...client, typeClient: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
                <SelectItem value="C9">C9</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Code ICE</Label>
            <Input
              value={client.codeICE}
              onChange={(e) => setClient({ ...client, codeICE: e.target.value })}
              placeholder="00XXXXXXXXXX00XX"
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              checked={client.facturationCP}
              onCheckedChange={(checked) =>
                setClient({ ...client, facturationCP: checked })
              }
            />
            <Label>Facturation Congés payés (CP)</Label>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="coefficients" className="space-y-4 mt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Heures normales</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coeffHeuresNormales}
              onChange={(e) =>
                setClient({ ...client, coeffHeuresNormales: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>HS 25%</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coeffHS25}
              onChange={(e) =>
                setClient({ ...client, coeffHS25: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>HS 50%</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coeffHS50}
              onChange={(e) =>
                setClient({ ...client, coeffHS50: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>HS 100%</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coeffHS100}
              onChange={(e) =>
                setClient({ ...client, coeffHS100: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Heures fériées/chômées</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coeffHeuresFeriees}
              onChange={(e) =>
                setClient({ ...client, coeffHeuresFeriees: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Indemnités soumises</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coeffIndemniteSoumise}
              onChange={(e) =>
                setClient({ ...client, coeffIndemniteSoumise: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Indemnités non soumises</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coeffIndemniteNonSoumise}
              onChange={(e) =>
                setClient({
                  ...client,
                  coeffIndemniteNonSoumise: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Congé payé</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coeffCP}
              onChange={(e) =>
                setClient({ ...client, coeffCP: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Coefficient Prime</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coeffPrime}
              onChange={(e) =>
                setClient({ ...client, coeffPrime: parseFloat(e.target.value) })
              }
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="travail" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Durée hebdomadaire (heures)</Label>
            <Input
              type="number"
              value={client.dureeHebdo}
              onChange={(e) =>
                setClient({ ...client, dureeHebdo: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Horaires de travail</Label>
            <Input
              value={client.horaires}
              onChange={(e) => setClient({ ...client, horaires: e.target.value })}
              placeholder="08:00 - 17:00"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="systeme" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={client.activationSTC}
              onCheckedChange={(checked) =>
                setClient({ ...client, activationSTC: checked })
              }
            />
            <Label>Activation STC</Label>
          </div>
          <div className="space-y-2">
            <Label>TVA</Label>
            <Select
              value={client.tva}
              onValueChange={(value: "Normale" | "Exonérée" | "Réduite") =>
                setClient({ ...client, tva: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normale">Normale (20%)</SelectItem>
                <SelectItem value="Exonérée">Exonérée</SelectItem>
                <SelectItem value="Réduite">Réduite (7%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mode d'édition facture</Label>
            <Select
              value={client.modeEditionFacture}
              onValueChange={(value: "Global" | "Salarié" | "Commande") =>
                setClient({ ...client, modeEditionFacture: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Global">Global</SelectItem>
                <SelectItem value="Salarié">Par salarié</SelectItem>
                <SelectItem value="Commande">Par commande</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={(client as Client).status}
                onValueChange={(value: "Actif" | "Inactif") =>
                  setClient({ ...client, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">
            Gestion des clients et de leurs paramètres
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
            </DialogHeader>
            <ClientForm client={newClient} setClient={setNewClient} />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddClient}>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clients.filter((c) => c.status === "Actif").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients inactifs</CardTitle>
            <Building2 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {clients.filter((c) => c.status === "Inactif").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type C1</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.typeClient === "C1").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, code ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
                <SelectItem value="C9">C9</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Raison Sociale</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Règlement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.raisonSociale}</p>
                      <p className="text-sm text-muted-foreground">{client.titre}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {client.telephone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.typeClient}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{client.modeReglement}</p>
                      <p className="text-muted-foreground">{client.delaiReglement}j</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={client.status === "Actif" ? "default" : "secondary"}
                      className={
                        client.status === "Actif"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails du client - {selectedClient?.code}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="general">Général</TabsTrigger>
                  <TabsTrigger value="facturation">Facturation</TabsTrigger>
                  <TabsTrigger value="coefficients">Coefficients</TabsTrigger>
                  <TabsTrigger value="travail">Travail</TabsTrigger>
                  <TabsTrigger value="systeme">Système</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Raison Sociale</Label>
                      <p className="font-medium">{selectedClient.raisonSociale}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Titre</Label>
                      <p className="font-medium">{selectedClient.titre}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Adresse</Label>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedClient.adresse}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Adresse de facturation</Label>
                      <p className="font-medium">{selectedClient.adresseFacturation || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Téléphone</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedClient.telephone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">E-mail</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedClient.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Nom du contact</Label>
                      <p className="font-medium">{selectedClient.nomContact}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Code commercial</Label>
                      <p className="font-medium">{selectedClient.codeCommercial || "-"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="facturation" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Mode de règlement</Label>
                      <p className="font-medium">{selectedClient.modeReglement}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Délai de règlement</Label>
                      <p className="font-medium">{selectedClient.delaiReglement} jours</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Code comptable</Label>
                      <p className="font-medium">{selectedClient.codeComptable}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Type de client</Label>
                      <Badge variant="outline">{selectedClient.typeClient}</Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Code ICE</Label>
                      <p className="font-medium">{selectedClient.codeICE}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Facturation CP</Label>
                      <Badge variant={selectedClient.facturationCP ? "default" : "secondary"}>
                        {selectedClient.facturationCP ? "Oui" : "Non"}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="coefficients" className="mt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Heures normales</Label>
                      <p className="font-medium">{selectedClient.coeffHeuresNormales}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">HS 25%</Label>
                      <p className="font-medium">{selectedClient.coeffHS25}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">HS 50%</Label>
                      <p className="font-medium">{selectedClient.coeffHS50}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">HS 100%</Label>
                      <p className="font-medium">{selectedClient.coeffHS100}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Heures fériées</Label>
                      <p className="font-medium">{selectedClient.coeffHeuresFeriees}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Indemnités soumises</Label>
                      <p className="font-medium">{selectedClient.coeffIndemniteSoumise}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Indemnités non soumises</Label>
                      <p className="font-medium">{selectedClient.coeffIndemniteNonSoumise}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Congé payé</Label>
                      <p className="font-medium">{selectedClient.coeffCP}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Coefficient Prime</Label>
                      <p className="font-medium">{selectedClient.coeffPrime}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="travail" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Durée hebdomadaire</Label>
                      <p className="font-medium">{selectedClient.dureeHebdo}h</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Horaires</Label>
                      <p className="font-medium">{selectedClient.horaires || "-"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="systeme" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Activation STC</Label>
                      <Badge variant={selectedClient.activationSTC ? "default" : "secondary"}>
                        {selectedClient.activationSTC ? "Oui" : "Non"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">TVA</Label>
                      <p className="font-medium">{selectedClient.tva}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Mode édition facture</Label>
                      <p className="font-medium">{selectedClient.modeEditionFacture}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Statut</Label>
                      <Badge
                        variant={selectedClient.status === "Actif" ? "default" : "secondary"}
                        className={
                          selectedClient.status === "Actif"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {selectedClient.status}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le client - {selectedClient?.code}</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <>
              <ClientForm
                client={selectedClient}
                setClient={setSelectedClient}
                isEdit
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleEditClient}>Enregistrer</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
