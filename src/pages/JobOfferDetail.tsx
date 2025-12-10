import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Briefcase, Building, Clock, Euro, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type JobOffer = Tables<"job_offers"> & {
  clients?: { raison_sociale: string } | null;
};

export default function JobOfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    cover_letter: "",
  });

  useEffect(() => {
    if (id) {
      fetchJobOffer();
    }
  }, [id]);

  const fetchJobOffer = async () => {
    try {
      const { data, error } = await supabase
        .from("job_offers")
        .select("*, clients(raison_sociale)")
        .eq("id", id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: "Offre introuvable",
          description: "Cette offre n'existe pas ou n'est plus disponible.",
          variant: "destructive",
        });
        navigate("/offres");
        return;
      }
      setJob(data);
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

  const getJobTypeLabel = (type: string | null) => {
    const types: Record<string, string> = {
      cdi: "CDI",
      cdd: "CDD",
      interim: "Intérim",
      freelance: "Freelance",
      stage: "Stage",
    };
    return types[type || ""] || type;
  };

  const getSalaryText = (min: number | null, max: number | null) => {
    if (min && max) return `${min.toLocaleString()}€ - ${max.toLocaleString()}€`;
    if (min) return `À partir de ${min.toLocaleString()}€`;
    if (max) return `Jusqu'à ${max.toLocaleString()}€`;
    return "Non communiqué";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("candidates").insert({
        job_offer_id: job.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        cover_letter: formData.cover_letter || null,
        status: "new",
      });

      if (error) throw error;

      toast({
        title: "Candidature envoyée",
        description: "Nous vous recontacterons dans les plus brefs délais.",
      });
      setFormData({ full_name: "", email: "", phone: "", cover_letter: "" });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la candidature.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/offres")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux offres
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-3xl">{job.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                        {job.clients?.raison_sociale && (
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {job.clients.raison_sociale}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        )}
                        {job.department && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.department}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {getJobTypeLabel(job.job_type)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Euro className="w-5 h-5" />
                      {getSalaryText(job.salary_min, job.salary_max)}
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {job.published_at
                        ? formatDistanceToNow(new Date(job.published_at), { addSuffix: true, locale: fr })
                        : "Récemment publié"}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {job.description && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Description du poste</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
                  </div>
                )}

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Responsabilités</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {job.responsibilities.map((resp, index) => (
                          <li key={index}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Compétences requises</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {job.benefits && job.benefits.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Avantages</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.benefits.map((benefit, index) => (
                          <Badge key={index} variant="secondary">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Postuler à cette offre</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      required
                      placeholder="Jean Dupont"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="jean@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover">Lettre de motivation</Label>
                    <Textarea
                      id="cover"
                      placeholder="Parlez-nous de vous et de vos motivations..."
                      rows={4}
                      value={formData.cover_letter}
                      onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {submitting ? "Envoi..." : "Envoyer ma candidature"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    En postulant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
