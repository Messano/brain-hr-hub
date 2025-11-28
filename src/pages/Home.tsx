import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicHeader } from "@/components/PublicHeader";
import { Search, Briefcase, Users, TrendingUp, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItMnptMCAydjJoMnYtMmgtMnptLTIgMGgtMnYyaDJ2LTJ6bTAtMnYtMmgtMnYyaDJ6bTIgMGgydi0yaC0ydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Trouvez le bon <span className="text-primary">candidat</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Pour chaque opération de recrutement notre objectif est de réussir l'adéquation poste/profil pour la satisfaction durable et profitable de l'entreprise et du candidat.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="hover-scale">
                  <Link to="/offres">
                    <Search className="w-5 h-5 mr-2" />
                    Voir les offres
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="hover-scale">
                  En savoir plus
                </Button>
              </div>
            </div>

            <div className="relative h-[400px] animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 to-transparent rounded-3xl transform -rotate-3"></div>
              <div className="relative h-full flex items-center justify-center">
                <Briefcase className="w-48 h-48 text-primary opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-2 p-6 rounded-lg bg-background hover-scale cursor-pointer transition-all">
              <Briefcase className="w-12 h-12 mx-auto text-primary" />
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm text-muted-foreground">Offres actives</div>
            </div>
            <div className="text-center space-y-2 p-6 rounded-lg bg-background hover-scale cursor-pointer transition-all">
              <Users className="w-12 h-12 mx-auto text-primary" />
              <div className="text-3xl font-bold">2500+</div>
              <div className="text-sm text-muted-foreground">Candidats</div>
            </div>
            <div className="text-center space-y-2 p-6 rounded-lg bg-background hover-scale cursor-pointer transition-all">
              <TrendingUp className="w-12 h-12 mx-auto text-primary" />
              <div className="text-3xl font-bold">95%</div>
              <div className="text-sm text-muted-foreground">Taux de succès</div>
            </div>
            <div className="text-center space-y-2 p-6 rounded-lg bg-background hover-scale cursor-pointer transition-all">
              <Award className="w-12 h-12 mx-auto text-primary" />
              <div className="text-3xl font-bold">15+</div>
              <div className="text-sm text-muted-foreground">Années d'expérience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Offers Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold">Offres d'emplois récents</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Consultez toutes nos offres d'emploi et postulez en un clic.
            </p>
          </div>

          {/* Search Filters */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid md:grid-cols-3 gap-4 p-6 rounded-xl bg-muted/50 backdrop-blur">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie de Métier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">Informatique</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="rh">Ressources Humaines</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paris">Paris</SelectItem>
                  <SelectItem value="lyon">Lyon</SelectItem>
                  <SelectItem value="marseille">Marseille</SelectItem>
                  <SelectItem value="toulouse">Toulouse</SelectItem>
                </SelectContent>
              </Select>

              <Button size="lg" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button size="lg" asChild className="hover-scale">
              <Link to="/offres">
                Voir toutes les offres
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <span className="text-2xl font-bold text-primary-foreground">B</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold">BrainCRM</span>
                  <span className="text-xs text-muted-foreground">Gestion RH</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Votre partenaire RH de confiance pour le recrutement et la gestion des talents.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">À propos</Link></li>
                <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Candidats</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/offres" className="hover:text-primary transition-colors">Offres d'emploi</Link></li>
                <li><Link to="/conseils" className="hover:text-primary transition-colors">Conseils carrière</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: contact@braincrm.fr</li>
                <li>Tél: +33 1 23 45 67 89</li>
                <li>Adresse: Paris, France</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} BrainCRM. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
