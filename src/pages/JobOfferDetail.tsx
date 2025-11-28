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
import { ArrowLeft, MapPin, Briefcase, Building, Clock, Euro, Send } from "lucide-react";

export default function JobOfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data - en production, ceci viendrait d'une API
  const job = {
    id: Number(id),
    title: "Développeur React Senior",
    department: "IT",
    location: "Paris",
    type: "CDI",
    salary: "50-60K€",
    published: "Il y a 2 jours",
    company: "Tech Solutions",
    description: `Nous recherchons un développeur React Senior passionné pour rejoindre notre équipe technique en pleine croissance.

Vous travaillerez sur des projets innovants et challengeants, en utilisant les dernières technologies du web.`,
    
    responsibilities: [
      "Développer et maintenir des applications React performantes",
      "Collaborer avec l'équipe produit et design",
      "Participer aux revues de code et mentorat des juniors",
      "Contribuer à l'amélioration continue de nos pratiques",
    ],
    
    requirements: [
      "5+ ans d'expérience en développement React",
      "Maîtrise de TypeScript et des hooks React",
      "Expérience avec Redux ou Context API",
      "Connaissance des tests unitaires (Jest, React Testing Library)",
      "Bonnes pratiques de développement (Git, CI/CD)",
    ],
    
    benefits: [
      "Télétravail flexible (2-3 jours/semaine)",
      "Tickets restaurant",
      "Mutuelle d'entreprise",
      "Formation continue",
      "Équipement haut de gamme",
      "RTT",
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Candidature envoyée",
      description: "Nous vous recontacterons dans les plus brefs délais.",
    });
  };

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
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">{job.type}</Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Euro className="w-5 h-5" />
                      {job.salary}
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {job.published}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Description du poste</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-3">Responsabilités</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-3">Compétences requises</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

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
                    <Input id="name" required placeholder="Jean Dupont" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required placeholder="jean@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input id="phone" type="tel" required placeholder="+33 6 12 34 56 78" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cv">CV *</Label>
                    <Input id="cv" type="file" required accept=".pdf,.doc,.docx" />
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max 5MB)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover">Lettre de motivation</Label>
                    <Textarea 
                      id="cover" 
                      placeholder="Parlez-nous de vous et de vos motivations..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer ma candidature
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
