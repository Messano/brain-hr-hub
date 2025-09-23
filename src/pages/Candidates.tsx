import { Search, Filter, Eye, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Candidates() {
  const candidates = [
    {
      name: "Marie Dupont",
      position: "Développeur React Senior",
      status: "interview",
      email: "marie.dupont@email.com",
      phone: "06 12 34 56 78",
      location: "Paris",
      experience: "5 ans",
      applied: "Il y a 2 jours"
    },
    {
      name: "Jean Martin",
      position: "Chef de Projet",
      status: "evaluation",
      email: "jean.martin@email.com", 
      phone: "06 87 65 43 21",
      location: "Lyon",
      experience: "8 ans",
      applied: "Il y a 1 semaine"
    },
    {
      name: "Sophie Bernard",
      position: "Consultant IT",
      status: "new",
      email: "sophie.bernard@email.com",
      phone: "06 55 44 33 22",
      location: "Marseille",
      experience: "3 ans",
      applied: "Il y a 3 heures"
    },
    {
      name: "Pierre Durand",
      position: "Développeur React Senior", 
      status: "rejected",
      email: "pierre.durand@email.com",
      phone: "06 99 88 77 66",
      location: "Toulouse",
      experience: "4 ans",
      applied: "Il y a 2 semaines"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-primary text-primary-foreground">Nouvelle</Badge>;
      case 'evaluation':
        return <Badge className="bg-warning text-warning-foreground">Évaluation</Badge>;
      case 'interview':
        return <Badge className="bg-success text-success-foreground">Entretien</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejetée</Badge>;
      case 'hired':
        return <Badge className="bg-success text-success-foreground">Embauchée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidatures</h1>
        <p className="text-muted-foreground">Gérez et suivez toutes vos candidatures</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un candidat..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Statut
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Poste
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      <div className="grid gap-4">
        {candidates.map((candidate, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                    <p className="text-muted-foreground">{candidate.position}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {candidate.location}
                      </span>
                      <span>{candidate.experience} d'expérience</span>
                      <span>{candidate.applied}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    {getStatusBadge(candidate.status)}
                    <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <Phone className="w-3 h-3" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button size="sm">
                      Évaluer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}