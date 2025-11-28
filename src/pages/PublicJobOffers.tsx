import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, Briefcase, Building } from "lucide-react";

export default function PublicJobOffers() {
  const [searchTerm, setSearchTerm] = useState("");

  const jobOffers = [
    {
      id: 1,
      title: "Développeur React Senior",
      department: "IT",
      location: "Paris",
      type: "CDI",
      salary: "50-60K€",
      published: "Il y a 2 jours",
      description: "Nous recherchons un développeur React expérimenté pour rejoindre notre équipe technique.",
      company: "Tech Solutions"
    },
    {
      id: 2,
      title: "Chef de Projet Digital",
      department: "Management",
      location: "Lyon",
      type: "CDI",
      salary: "45-55K€",
      published: "Il y a 3 jours",
      description: "Pilotez des projets digitaux d'envergure dans un environnement dynamique.",
      company: "Digital Corp"
    },
    {
      id: 3,
      title: "Consultant IT",
      department: "IT",
      location: "Marseille",
      type: "Mission",
      salary: "400-500€/jour",
      published: "Il y a 5 jours",
      description: "Mission de conseil en transformation digitale auprès de grands comptes.",
      company: "Consulting Group"
    },
    {
      id: 4,
      title: "Responsable RH",
      department: "Ressources Humaines",
      location: "Paris",
      type: "CDI",
      salary: "40-50K€",
      published: "Il y a 1 semaine",
      description: "Gérez l'ensemble des processus RH d'une entreprise en forte croissance.",
      company: "Innovation Ltd"
    },
    {
      id: 5,
      title: "Développeur Full Stack",
      department: "IT",
      location: "Toulouse",
      type: "CDI",
      salary: "45-55K€",
      published: "Il y a 1 semaine",
      description: "Développez des applications web innovantes avec les dernières technologies.",
      company: "StartUp Tech"
    },
    {
      id: 6,
      title: "Commercial B2B",
      department: "Commercial",
      location: "Lyon",
      type: "CDI",
      salary: "35-45K€ + variables",
      published: "Il y a 2 semaines",
      description: "Développez notre portefeuille clients dans le secteur du B2B.",
      company: "Sales Pro"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold">Offres d'emploi</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez toutes nos opportunités de carrière et trouvez le poste qui vous correspond.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Rechercher un poste..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Département" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="rh">RH</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Ville" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="paris">Paris</SelectItem>
                      <SelectItem value="lyon">Lyon</SelectItem>
                      <SelectItem value="marseille">Marseille</SelectItem>
                      <SelectItem value="toulouse">Toulouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Job Offers List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{jobOffers.length}</span> offres disponibles
            </p>
            <Select defaultValue="recent">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récent</SelectItem>
                <SelectItem value="salary">Salaire</SelectItem>
                <SelectItem value="location">Localisation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {jobOffers.map((job) => (
              <Card 
                key={job.id} 
                className="hover:shadow-lg transition-all duration-300 hover-scale cursor-pointer"
              >
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl hover:text-primary transition-colors">
                        <Link to={`/offres/${job.id}`}>{job.title}</Link>
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <Badge className="bg-primary text-primary-foreground">{job.type}</Badge>
                      <span className="text-sm font-semibold text-primary">{job.salary}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{job.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.published}
                    </span>
                    <Button asChild>
                      <Link to={`/offres/${job.id}`}>
                        Voir l'offre
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Vous ne trouvez pas ce que vous cherchez ?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Envoyez-nous votre candidature spontanée et nous vous contacterons dès qu'une opportunité correspondante se présente.
          </p>
          <Button size="lg" className="hover-scale">
            Candidature spontanée
          </Button>
        </div>
      </section>
    </div>
  );
}
