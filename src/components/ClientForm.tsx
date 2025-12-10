import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Client = Tables<"clients">;
type ClientInsert = TablesInsert<"clients">;

interface ClientFormProps {
  client: Omit<ClientInsert, "code"> | Client;
  onChange: (field: string, value: any) => void;
  isEdit?: boolean;
}

export function ClientForm({ client, onChange, isEdit = false }: ClientFormProps) {
  return (
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
              value={client.raison_sociale}
              onChange={(e) => onChange("raison_sociale", e.target.value)}
              placeholder="Nom de la société"
            />
          </div>
          <div className="space-y-2">
            <Label>Titre</Label>
            <Select
              value={client.titre || ""}
              onValueChange={(value) => onChange("titre", value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SA">SA</SelectItem>
                <SelectItem value="SOC">SOC</SelectItem>
                <SelectItem value="SARL">SARL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Adresse</Label>
            <Input
              value={client.adresse || ""}
              onChange={(e) => onChange("adresse", e.target.value || null)}
              placeholder="Adresse complète"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Adresse de facturation</Label>
            <Input
              value={client.adresse_facturation || ""}
              onChange={(e) => onChange("adresse_facturation", e.target.value || null)}
              placeholder="Si différente de l'adresse principale"
            />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input
              value={client.telephone || ""}
              onChange={(e) => onChange("telephone", e.target.value || null)}
              placeholder="+212 5XX XXX XXX"
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={client.email || ""}
              onChange={(e) => onChange("email", e.target.value || null)}
              placeholder="contact@societe.ma"
            />
          </div>
          <div className="space-y-2">
            <Label>Nom du contact</Label>
            <Input
              value={client.contact_nom || ""}
              onChange={(e) => onChange("contact_nom", e.target.value || null)}
              placeholder="Responsable du site"
            />
          </div>
          <div className="space-y-2">
            <Label>Code commercial</Label>
            <Input
              value={client.code_commercial || ""}
              onChange={(e) => onChange("code_commercial", e.target.value || null)}
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
              value={client.mode_reglement || "virement"}
              onValueChange={(value) => onChange("mode_reglement", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cheque">Chèque</SelectItem>
                <SelectItem value="traite">Traite</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Délai de règlement (jours)</Label>
            <Select
              value={String(client.delai_reglement || 30)}
              onValueChange={(value) => onChange("delai_reglement", parseInt(value))}
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
              value={client.code_comptable || ""}
              onChange={(e) => onChange("code_comptable", e.target.value || null)}
              placeholder="411XXX"
            />
          </div>
          <div className="space-y-2">
            <Label>Type de client</Label>
            <Select
              value={client.type_client || "C1"}
              onValueChange={(value) => onChange("type_client", value)}
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
              value={client.code_ice || ""}
              onChange={(e) => onChange("code_ice", e.target.value || null)}
              placeholder="00XXXXXXXXXX00XX"
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              checked={client.facturation_cp || false}
              onCheckedChange={(checked) => onChange("facturation_cp", checked)}
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
              value={client.coef_heures_normales || 1}
              onChange={(e) => onChange("coef_heures_normales", parseFloat(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>HS 25%</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coef_heures_sup_25 || 1.25}
              onChange={(e) => onChange("coef_heures_sup_25", parseFloat(e.target.value) || 1.25)}
            />
          </div>
          <div className="space-y-2">
            <Label>HS 50%</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coef_heures_sup_50 || 1.5}
              onChange={(e) => onChange("coef_heures_sup_50", parseFloat(e.target.value) || 1.5)}
            />
          </div>
          <div className="space-y-2">
            <Label>HS 100%</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coef_heures_sup_100 || 2}
              onChange={(e) => onChange("coef_heures_sup_100", parseFloat(e.target.value) || 2)}
            />
          </div>
          <div className="space-y-2">
            <Label>Heures fériées/chômées</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coef_heures_feriees || 2}
              onChange={(e) => onChange("coef_heures_feriees", parseFloat(e.target.value) || 2)}
            />
          </div>
          <div className="space-y-2">
            <Label>Indemnités soumises</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coef_indemnites_soumises || 1}
              onChange={(e) => onChange("coef_indemnites_soumises", parseFloat(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>Indemnités non soumises</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coef_indemnites_non_soumises || 1}
              onChange={(e) => onChange("coef_indemnites_non_soumises", parseFloat(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>Congé payé</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coef_conge_paye || 1}
              onChange={(e) => onChange("coef_conge_paye", parseFloat(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>Coefficient Prime</Label>
            <Input
              type="number"
              step="0.01"
              value={client.coef_prime || 1}
              onChange={(e) => onChange("coef_prime", parseFloat(e.target.value) || 1)}
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
              value={client.duree_hebdomadaire || 44}
              onChange={(e) => onChange("duree_hebdomadaire", parseInt(e.target.value) || 44)}
            />
          </div>
          <div className="space-y-2">
            <Label>Horaires de travail</Label>
            <Input
              value={client.horaires_travail || ""}
              onChange={(e) => onChange("horaires_travail", e.target.value || null)}
              placeholder="08:00 - 17:00"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="systeme" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={client.activation_stc || false}
              onCheckedChange={(checked) => onChange("activation_stc", checked)}
            />
            <Label>Activation STC</Label>
          </div>
          <div className="space-y-2">
            <Label>TVA</Label>
            <Select
              value={client.tva || "normale"}
              onValueChange={(value) => onChange("tva", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normale">Normale (20%)</SelectItem>
                <SelectItem value="exoneree">Exonérée</SelectItem>
                <SelectItem value="reduite">Réduite (7%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mode d'édition facture</Label>
            <Select
              value={client.mode_edition_facture || "global"}
              onValueChange={(value) => onChange("mode_edition_facture", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="salarie">Par salarié</SelectItem>
                <SelectItem value="commande">Par commande</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={(client as Client).is_active ? "active" : "inactive"}
                onValueChange={(value) => onChange("is_active", value === "active")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
