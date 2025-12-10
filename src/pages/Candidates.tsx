import { useState, useEffect } from "react";
import { Search, Filter, Eye, Phone, Mail, MapPin, X, Star, FileText, Calendar, Briefcase, Loader2, ExternalLink } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cv_url: string | null;
  cover_letter: string | null;
  status: string | null;
  rating: number | null;
  notes: string | null;
  applied_at: string | null;
  job_offer_id: string | null;
  job_offer?: {
    id: string;
    title: string;
    location: string | null;
  } | null;
}

interface JobOffer {
  id: string;
  title: string;
}

export default function Candidates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [jobOfferFilter, setJobOfferFilter] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [evalNote, setEvalNote] = useState("");
  const [evalRating, setEvalRating] = useState<number>(0);
  const [evalDecision, setEvalDecision] = useState<string>("");
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchJobOffers();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          *,
          job_offer:job_offers(id, title, location)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des candidats");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('job_offers')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setJobOffers(data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.job_offer?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = !statusFilter || candidate.status === statusFilter;
    const matchesJobOffer = !jobOfferFilter || candidate.job_offer_id === jobOfferFilter;
    return matchesSearch && matchesStatus && matchesJobOffer;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-primary text-primary-foreground">Nouvelle</Badge>;
      case 'screening':
        return <Badge className="bg-warning text-warning-foreground">Présélection</Badge>;
      case 'interview':
        return <Badge className="bg-success text-success-foreground">Entretien</Badge>;
      case 'offer':
        return <Badge className="bg-info text-info-foreground">Offre</Badge>;
      case 'hired':
        return <Badge className="bg-success text-success-foreground">Embauché</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status || 'Inconnu'}</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Nouvelle';
      case 'screening': return 'Présélection';
      case 'interview': return 'Entretien';
      case 'offer': return 'Offre';
      case 'hired': return 'Embauché';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatAppliedDate = (date: string | null) => {
    if (!date) return 'Date inconnue';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return 'Date inconnue';
    }
  };

  const handleView = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsViewOpen(true);
  };

  const handleEvaluate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setEvalNote(candidate.notes || "");
    setEvalRating(candidate.rating || 0);
    setEvalDecision(candidate.status || "");
    setIsEvalOpen(true);
  };

  const submitEvaluation = async () => {
    if (!evalDecision) {
      toast.error("Veuillez sélectionner une décision");
      return;
    }

    if (!selectedCandidate) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('candidates')
        .update({
          status: evalDecision as any,
          rating: evalRating > 0 ? evalRating : null,
          notes: evalNote || null
        })
        .eq('id', selectedCandidate.id);

      if (error) throw error;

      toast.success(`Évaluation de ${selectedCandidate.full_name} enregistrée`);
      setIsEvalOpen(false);
      fetchCandidates();
    } catch (error: any) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setJobOfferFilter(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <DropdownMenuItem onClick={() => setStatusFilter("screening")}>Présélection</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("interview")}>Entretien</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("offer")}>Offre</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("hired")}>Embauché</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Rejeté</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={jobOfferFilter ? "default" : "outline"}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  {jobOfferFilter ? jobOffers.find(j => j.id === jobOfferFilter)?.title?.slice(0, 20) + '...' : "Offre d'emploi"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto">
                <DropdownMenuItem onClick={() => setJobOfferFilter(null)}>Toutes les offres</DropdownMenuItem>
                {jobOffers.map(offer => (
                  <DropdownMenuItem key={offer.id} onClick={() => setJobOfferFilter(offer.id)}>
                    {offer.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(searchQuery || statusFilter || jobOfferFilter) && (
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
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(candidate.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{candidate.full_name}</h3>
                    <p className="text-muted-foreground">{candidate.job_offer?.title || 'Candidature spontanée'}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1 flex-wrap gap-y-1">
                      {candidate.job_offer?.location && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {candidate.job_offer.location}
                        </span>
                      )}
                      <span>{formatAppliedDate(candidate.applied_at)}</span>
                      {candidate.rating && (
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-warning text-warning" />
                          {candidate.rating}/5
                        </span>
                      )}
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
                      {candidate.phone && (
                        <a href={`tel:${candidate.phone}`} title={candidate.phone}>
                          <Phone className="w-4 h-4 hover:text-primary cursor-pointer" />
                        </a>
                      )}
                      {candidate.cv_url && (
                        <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer" title="Voir CV">
                          <FileText className="w-4 h-4 hover:text-primary cursor-pointer" />
                        </a>
                      )}
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
              {(searchQuery || statusFilter || jobOfferFilter) && (
                <Button variant="link" onClick={clearFilters}>Effacer les filtres</Button>
              )}
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
                  {selectedCandidate && getInitials(selectedCandidate.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <span>{selectedCandidate?.full_name}</span>
                <p className="text-sm font-normal text-muted-foreground">
                  {selectedCandidate?.job_offer?.title || 'Candidature spontanée'}
                </p>
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
                <span className="text-sm text-muted-foreground">
                  • {formatAppliedDate(selectedCandidate.applied_at)}
                </span>
                {selectedCandidate.rating && (
                  <div className="flex items-center gap-1 ml-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= selectedCandidate.rating!
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${selectedCandidate.email}`} className="hover:underline">
                      {selectedCandidate.email}
                    </a>
                  </div>
                  {selectedCandidate.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedCandidate.phone}`} className="hover:underline">
                        {selectedCandidate.phone}
                      </a>
                    </div>
                  )}
                  {selectedCandidate.job_offer?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCandidate.job_offer.location}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedCandidate.cv_url && (
                    <a
                      href={selectedCandidate.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Voir le CV
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {selectedCandidate.cover_letter && (
                <div>
                  <h4 className="font-medium mb-2">Lettre de motivation</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedCandidate.cover_letter}
                  </p>
                </div>
              )}

              {selectedCandidate.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes d'évaluation</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedCandidate.notes}
                  </p>
                </div>
              )}

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
            <DialogTitle>Évaluer {selectedCandidate?.full_name}</DialogTitle>
            <DialogDescription>
              {selectedCandidate?.job_offer?.title || 'Candidature spontanée'}
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
              <Label className="mb-2 block">Décision</Label>
              <Select value={evalDecision} onValueChange={setEvalDecision}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une décision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nouvelle</SelectItem>
                  <SelectItem value="screening">Présélection</SelectItem>
                  <SelectItem value="interview">Entretien</SelectItem>
                  <SelectItem value="offer">Offre</SelectItem>
                  <SelectItem value="hired">Embauché</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Notes</Label>
              <Textarea
                placeholder="Ajouter des notes sur ce candidat..."
                value={evalNote}
                onChange={(e) => setEvalNote(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={submitEvaluation} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
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
