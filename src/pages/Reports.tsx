import { Download, BarChart3, FileText, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const reports = [
    {
      name: "Rapport Recrutement",
      description: "Statistiques des candidatures et taux de conversion",
      lastGenerated: "Il y a 2 jours",
      format: ["PDF", "Excel"],
      status: "ready"
    },
    {
      name: "Masse Salariale",
      description: "Analyse des coûts salariaux par département",
      lastGenerated: "Il y a 1 semaine", 
      format: ["Excel", "CSV"],
      status: "ready"
    },
    {
      name: "Formations & Compétences",
      description: "Suivi des formations et développement des compétences",
      lastGenerated: "Il y a 3 jours",
      format: ["PDF"],
      status: "ready"
    },
    {
      name: "Rapport Mensuel RH",
      description: "Vue d'ensemble de l'activité RH du mois",
      lastGenerated: "En cours...",
      format: ["PDF", "Excel"],
      status: "generating"
    }
  ];

  const quickExports = [
    {
      title: "Liste des employés",
      description: "Export complet de la base employés",
      icon: FileText
    },
    {
      title: "Candidatures du mois",
      description: "Toutes les candidatures reçues",
      icon: BarChart3
    },
    {
      title: "Planning des formations", 
      description: "Calendrier des formations planifiées",
      icon: Calendar
    },
    {
      title: "Statistiques missions",
      description: "Données des missions d'intérim",
      icon: TrendingUp
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-success text-success-foreground">Prêt</Badge>;
      case 'generating':
        return <Badge className="bg-warning text-warning-foreground">En cours</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapports & Export</h1>
        <p className="text-muted-foreground">Génération de rapports et export des données RH</p>
      </div>

      {/* Quick Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Exports rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickExports.map((export_, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <export_.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">{export_.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {export_.description}
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  <Download className="w-3 h-3 mr-2" />
                  Exporter
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports générés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{report.name}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Dernière génération: {report.lastGenerated}</span>
                    <span>Formats: {report.format.join(", ")}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(report.status)}
                  <div className="flex space-x-2">
                    {report.status === 'ready' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Télécharger
                        </Button>
                        <Button size="sm">
                          Régénérer
                        </Button>
                      </>
                    )}
                    {report.status === 'generating' && (
                      <Button size="sm" disabled>
                        Génération...
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Créateur de rapport personnalisé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Données à inclure</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Candidatures et recrutement</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Missions et contrats</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Données de paie</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Formations et compétences</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Période</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="period" className="rounded" />
                  <span>7 derniers jours</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="period" className="rounded" />
                  <span>30 derniers jours</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="period" className="rounded" />
                  <span>3 derniers mois</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="period" className="rounded" />
                  <span>Période personnalisée</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <Button className="w-full md:w-auto">
              <BarChart3 className="w-4 h-4 mr-2" />
              Générer le rapport
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}