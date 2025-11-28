import { Plus, Search, Filter, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";

export default function Recruitment() {
  const navigate = useNavigate();
  
  const jobOffers = [
    {
      title: "Développeur React Senior",
      department: "IT",
      location: "Paris",
      type: "CDI",
      status: "active",
      applications: 12,
      published: "Il y a 3 jours"
    },
    {
      title: "Chef de Projet",
      department: "Management",
      location: "Lyon",
      type: "CDI",
      status: "active",
      applications: 8,
      published: "Il y a 1 semaine"
    },
    {
      title: "Consultant IT",
      department: "IT",
      location: "Marseille",
      type: "Mission",
      status: "draft",
      applications: 0,
      published: "Brouillon"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'closed':
        return <Badge variant="secondary">Fermée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recrutement</h1>
          <p className="text-muted-foreground">Gérez vos offres d'emploi et processus de recrutement</p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => navigate("/recruitment/new")}
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle offre</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Offres actives"
          value="8"
          icon={Filter}
          variant="success"
        />
        <KPICard
          title="Candidatures reçues"
          value="45"
          change="+15 cette semaine"
          icon={Search}
        />
        <KPICard
          title="En cours d'évaluation"
          value="12"
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Taux de conversion"
          value="27%"
          change="+5% vs. mois dernier"
          icon={Plus}
          variant="success"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher une offre..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Offers List */}
      <div className="grid gap-4">
        {jobOffers.map((job, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{job.department}</span>
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location}
                    </span>
                    <span>{job.type}</span>
                  </div>
                </div>
                {getStatusBadge(job.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="font-medium">{job.applications} candidatures</span>
                  <span className="text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {job.published}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Voir les candidatures
                  </Button>
                  <Button size="sm">
                    Modifier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}