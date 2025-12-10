import { useState, useEffect } from "react";
import { Plus, Search, Filter, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type JobOffer = Tables<"job_offers">;

export default function Recruitment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchJobOffers();
  }, []);

  const fetchJobOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("job_offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobOffers(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les offres d'emploi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      case "closed":
        return <Badge variant="secondary">Fermée</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

  const getPublishedText = (publishedAt: string | null, createdAt: string | null) => {
    if (publishedAt) {
      return formatDistanceToNow(new Date(publishedAt), { addSuffix: true, locale: fr });
    }
    if (createdAt) {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: fr });
    }
    return "Brouillon";
  };

  const filteredOffers = jobOffers.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeOffers = jobOffers.filter((job) => job.status === "active").length;
  const draftOffers = jobOffers.filter((job) => job.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recrutement</h1>
          <p className="text-muted-foreground">Gérez vos offres d'emploi et processus de recrutement</p>
        </div>
        <Button
          className="flex items-center space-x-2"
          onClick={() => navigate("/admin/recruitment/new")}
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle offre</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Offres actives"
          value={String(activeOffers)}
          icon={Filter}
          variant="success"
        />
        <KPICard
          title="Total offres"
          value={String(jobOffers.length)}
          icon={Search}
        />
        <KPICard
          title="En brouillon"
          value={String(draftOffers)}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Offres fermées"
          value={String(jobOffers.filter((j) => j.status === "closed").length)}
          icon={Plus}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
        {loading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Chargement...</p>
            </CardContent>
          </Card>
        ) : filteredOffers.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                {searchTerm ? "Aucune offre trouvée" : "Aucune offre d'emploi. Créez votre première offre !"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOffers.map((job) => (
            <Card
              key={job.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/admin/recruitment/${job.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{job.department}</span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {job.location || "Non spécifié"}
                      </span>
                      <span>{getJobTypeLabel(job.job_type)}</span>
                    </div>
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {getPublishedText(job.published_at, job.created_at)}
                    </span>
                  </div>
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/candidates?job=${job.id}`)}
                    >
                      Voir les candidatures
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/admin/recruitment/${job.id}/edit`)}
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
