import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, Briefcase, Building, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type JobOffer = Tables<"job_offers"> & {
  clients?: { raison_sociale: string } | null;
};

export default function PublicJobOffers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobOffers();
  }, []);

  const fetchJobOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("job_offers")
        .select("*, clients(raison_sociale)")
        .eq("status", "active")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setJobOffers(data || []);
    } catch (error) {
      console.error("Error fetching job offers:", error);
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
    return null;
  };

  // Get unique departments and locations for filters
  const departments = [...new Set(jobOffers.map((j) => j.department).filter(Boolean))] as string[];
  const locations = [...new Set(jobOffers.map((j) => j.location).filter(Boolean))] as string[];

  // Filter job offers
  const filteredOffers = jobOffers.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter === "all" || job.department === departmentFilter;
    const matchesLocation = locationFilter === "all" || job.location === locationFilter;

    return matchesSearch && matchesDepartment && matchesLocation;
  });

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

                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Département" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les départements</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ville" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
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
              <span className="font-semibold text-foreground">{filteredOffers.length}</span> offres disponibles
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredOffers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm || departmentFilter !== "all" || locationFilter !== "all"
                    ? "Aucune offre ne correspond à votre recherche."
                    : "Aucune offre d'emploi disponible pour le moment."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredOffers.map((job) => (
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
                          {job.clients?.raison_sociale && (
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {job.clients.raison_sociale}
                            </span>
                          )}
                          {job.department && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {job.department}
                            </span>
                          )}
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <Badge className="bg-primary text-primary-foreground">
                          {getJobTypeLabel(job.job_type)}
                        </Badge>
                        {getSalaryText(job.salary_min, job.salary_max) && (
                          <span className="text-sm font-semibold text-primary">
                            {getSalaryText(job.salary_min, job.salary_max)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {job.description && (
                      <p className="text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.published_at
                          ? formatDistanceToNow(new Date(job.published_at), { addSuffix: true, locale: fr })
                          : "Récemment publié"}
                      </span>
                      <Button asChild>
                        <Link to={`/offres/${job.id}`}>Voir l'offre</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
