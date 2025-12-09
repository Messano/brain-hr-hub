import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function PublicHeader() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <span className="text-2xl font-bold text-primary-foreground">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">BrainCRM</span>
              <span className="text-xs text-muted-foreground">Gestion RH</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link to="/offres" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Offres d'emploi
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              À propos
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link to="/admin">
                    <User className="w-4 h-4 mr-2" />
                    Espace Admin
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden md:flex">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" asChild className="hidden md:flex">
                <Link to="/auth">
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </Link>
              </Button>
            )}
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Confiez-nous une mission
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}