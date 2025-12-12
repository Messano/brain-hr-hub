import { Save, Bell, Shield, Database, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DataExport } from "@/components/DataExport";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configuration de l'application et préférences système</p>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Informations de l'entreprise</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nom de l'entreprise</Label>
              <Input id="company-name" placeholder="BrainCorp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email de contact</Label>
              <Input id="company-email" type="email" placeholder="contact@braincorp.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Téléphone</Label>
              <Input id="company-phone" placeholder="01 23 45 67 89" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-siret">SIRET</Label>
              <Input id="company-siret" placeholder="12345678901234" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-address">Adresse</Label>
            <Input id="company-address" placeholder="123 Rue de la Paix, 75001 Paris" />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Notifications par email</Label>
              <p className="text-sm text-muted-foreground">Recevoir les alertes importantes par email</p>
            </div>
            <Switch id="email-notifications" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="candidate-notifications">Nouvelles candidatures</Label>
              <p className="text-sm text-muted-foreground">Alertes pour les nouvelles candidatures</p>
            </div>
            <Switch id="candidate-notifications" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="contract-notifications">Échéances contrats</Label>
              <p className="text-sm text-muted-foreground">Rappels pour les contrats à renouveler</p>
            </div>
            <Switch id="contract-notifications" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="training-notifications">Formations obligatoires</Label>
              <p className="text-sm text-muted-foreground">Rappels pour les formations à compléter</p>
            </div>
            <Switch id="training-notifications" />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Sécurité</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
              <p className="text-sm text-muted-foreground">Sécurité renforcée pour les comptes administrateurs</p>
            </div>
            <Switch id="two-factor" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="session-timeout">Déconnexion automatique</Label>
              <p className="text-sm text-muted-foreground">Déconnecter après 30 minutes d'inactivité</p>
            </div>
            <Switch id="session-timeout" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="password-policy">Politique de mot de passe</Label>
            <div className="text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Minimum 8 caractères</li>
                <li>Au moins une majuscule et une minuscule</li>
                <li>Au moins un chiffre et un caractère spécial</li>
                <li>Renouvellement tous les 90 jours</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Intégrations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Email SMTP</h4>
              <p className="text-sm text-muted-foreground mb-3">Configuration du serveur email</p>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Signature électronique</h4>
              <p className="text-sm text-muted-foreground mb-3">DocuSign / Yousign</p>
              <Button variant="outline" size="sm">Connecter</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Système de paie</h4>
              <p className="text-sm text-muted-foreground mb-3">Export automatique vers votre logiciel</p>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Job boards</h4>
              <p className="text-sm text-muted-foreground mb-3">LinkedIn, Indeed, Pôle Emploi</p>
              <Button variant="outline" size="sm">Connecter</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <DataExport />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Enregistrer les modifications</span>
        </Button>
      </div>
    </div>
  );
}