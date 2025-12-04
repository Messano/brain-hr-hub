import { useState } from "react";
import { Search, Filter, Eye, Phone, Mail, MapPin, X, Star, FileText, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Candidate {
  name: string;
  position: string;
  status: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  applied: string;
  cv?: string;
  motivation?: string;
  skills?: string[];
  education?: string;
  salary?: string;
}

export default function Candidates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [evalNote, setEvalNote] = useState("");
  const [evalRating, setEvalRating] = useState<number>(0);
  const [evalDecision, setEvalDecision] = useState<string>("");

  const candidates: Candidate[] = [
    {
      name: "Marie Dupont",
      position: "Développeur React Senior",
      status: "interview",
      email: "marie.dupont@email.com",
      phone: "06 12 34 56 78",
      location: "Paris",
      experience: "5 ans",
      applied: "Il y a 2 jours",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      education: "Master Informatique - Université Paris-Saclay",
      salary: "55 000 € - 65 000 €",
      motivation: "Passionnée par le développement web moderne, je souhaite rejoindre une équipe dynamique pour contribuer à des projets innovants."
    },
    {
      name: "Jean Martin",
      position: "Chef de Projet",
      status: "evaluation",
      email: "jean.martin@email.com", 
      phone: "06 87 65 43 21",
      location: "Lyon",
      experience: "8 ans",
      applied: "Il y a 1 semaine",
      skills: ["Gestion de projet", "Agile", "Scrum", "Leadership"],
      education: "MBA Management - EM Lyon",
      salary: "60 000 € - 75 000 €",
      motivation: "Fort de 8 années d'expérience en gestion de projets IT, je cherche à relever de nouveaux défis dans une entreprise en croissance."
    },
    {
      name: "Sophie Bernard",
      position: "Consultant IT",
      status: "new",
      email: "sophie.bernard@email.com",
      phone: "06 55 44 33 22",
      location: "Marseille",
      experience: "3 ans",
      applied: "Il y a 3 heures",
      skills: ["SAP", "ERP", "Analyse fonctionnelle", "SQL"],
      education: "Ingénieur INSA Lyon",
      salary: "45 000 € - 55 000 €",
      motivation: "Je souhaite mettre mes compétences en conseil IT au service d'une entreprise ambitieuse."
    },
    {
      name: "Pierre Durand",
      position: "Développeur React Senior", 
      status: "rejected",
      email: "pierre.durand@email.com",
      phone: "06 99 88 77 66",
      location: "Toulouse",
      experience: "4 ans",
      applied: "Il y a 2 semaines",
      skills: ["React", "JavaScript", "CSS", "Git"],
      education: "DUT Informatique - IUT Toulouse",
      salary: "45 000 € - 50 000 €",
      motivation: "Développeur passionné, je recherche une opportunité pour évoluer vers des responsabilités techniques."
    }
  ];

  const positions = [...new Set(candidates.map(c => c.position))];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || candidate.status === statusFilter;
    const matchesPosition = !positionFilter || candidate.position === positionFilter;
    return matchesSearch && matchesStatus && matchesPosition;
  });

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Nouvelle';
      case 'evaluation': return 'Évaluation';
      case 'interview': return 'Entretien';
      case 'rejected': return 'Rejetée';
      case 'hired': return 'Embauchée';
      default: return status;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleView = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsViewOpen(true);
  };

  const handleEvaluate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setEvalNote("");
    setEvalRating(0);
    setEvalDecision("");
    setIsEvalOpen(true);
  };

  const submitEvaluation = () => {
    if (!evalDecision) {
      toast.error("Veuillez sélectionner une décision");
      return;
    }
    toast.success(`Évaluation de ${selectedCandidate?.name} enregistrée avec succès`);
    setIsEvalOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setPositionFilter(null);
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
          <div className="flex items-center space-x-4 flex-wrap gap-y-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un candidat..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={statusFilter ? "default" : "outline"}>
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter ? getStatusLabel(statusFilter) : "Statut"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>Tous</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("new")}>Nouvelle</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("evaluation")}>Évaluation</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("interview")}>Entretien</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Rejetée</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("hired")}>Embauchée</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={positionFilter ? "default" : "outline"}>
                  <Filter className="w-4 h-4 mr-2" />
                  {positionFilter || "Poste"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setPositionFilter(null)}>Tous</DropdownMenuItem>
                {positions.map(position => (
                  <DropdownMenuItem key={position} onClick={() => setPositionFilter(position)}>
                    {position}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(searchQuery || statusFilter || positionFilter) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} trouvé{filteredCandidates.length > 1 ? 's' : ''}
      </p>

      {/* Candidates List */}
      <div className="grid gap-4">
        {filteredCandidates.map((candidate, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                    <p className="text-muted-foreground">{candidate.position}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1 flex-wrap gap-y-1">
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
                      <a href={`mailto:${candidate.email}`} title={candidate.email}>
                        <Mail className="w-4 h-4 hover:text-primary cursor-pointer" />
                      </a>
                      <a href={`tel:${candidate.phone}`} title={candidate.phone}>
                        <Phone className="w-4 h-4 hover:text-primary cursor-pointer" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(candidate)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button size="sm" onClick={() => handleEvaluate(candidate)}>
                      Évaluer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCandidates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Aucun candidat trouvé</p>
              <Button variant="link" onClick={clearFilters}>Effacer les filtres</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Candidate Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedCandidate && getInitials(selectedCandidate.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <span>{selectedCandidate?.name}</span>
                <p className="text-sm font-normal text-muted-foreground">{selectedCandidate?.position}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Détails complets du candidat
            </DialogDescription>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedCandidate.status)}
                <span className="text-sm text-muted-foreground">• {selectedCandidate.applied}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${selectedCandidate.email}`} className="hover:underline">{selectedCandidate.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${selectedCandidate.phone}`} className="hover:underline">{selectedCandidate.phone}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedCandidate.location}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedCandidate.experience} d'expérience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedCandidate.education}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Prétentions: {selectedCandidate.salary}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Compétences</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills?.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Lettre de motivation</h4>
                <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                  {selectedCandidate.motivation}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1" onClick={() => { setIsViewOpen(false); handleEvaluate(selectedCandidate); }}>
                  Évaluer ce candidat
                </Button>
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Evaluate Candidate Dialog */}
      <Dialog open={isEvalOpen} onOpenChange={setIsEvalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Évaluer {selectedCandidate?.name}</DialogTitle>
            <DialogDescription>
              {selectedCandidate?.position}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="mb-2 block">Note globale</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEvalRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= evalRating
                          ? "fill-warning text-warning"
                          : "text-muted-foreground hover:text-warning"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="decision">Décision</Label>
              <Select value={evalDecision} onValueChange={setEvalDecision}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner une décision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interview">Convoquer en entretien</SelectItem>
                  <SelectItem value="shortlist">Mettre en shortlist</SelectItem>
                  <SelectItem value="hold">Mettre en attente</SelectItem>
                  <SelectItem value="reject">Rejeter la candidature</SelectItem>
                  <SelectItem value="hire">Proposer une embauche</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes et commentaires</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez vos observations sur ce candidat..."
                value={evalNote}
                onChange={(e) => setEvalNote(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={submitEvaluation}>
                Enregistrer l'évaluation
              </Button>
              <Button variant="outline" onClick={() => setIsEvalOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
