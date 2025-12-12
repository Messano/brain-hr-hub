import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppRole } from "@/hooks/useUsers";
import { Loader2 } from "lucide-react";

interface InviteUserFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteUserForm({ open, onClose, onSuccess }: InviteUserFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AppRole>("user");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);

    try {
      // Store current session to restore after signup
      const { data: currentSession } = await supabase.auth.getSession();
      
      // Create user via Supabase Auth admin invite
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Wait a bit for the trigger to create profile and role
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update profile with additional info
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            department: department || null,
            phone: phone || null
          })
          .eq('user_id', data.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        // Update role if not default user
        if (role !== 'user') {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role })
            .eq('user_id', data.user.id);

          if (roleError) {
            console.error('Role update error:', roleError);
          }
        }

        // Restore original session if it was replaced
        if (currentSession?.session) {
          await supabase.auth.setSession({
            access_token: currentSession.session.access_token,
            refresh_token: currentSession.session.refresh_token
          });
        }

        toast.success(`Utilisateur "${fullName}" créé avec succès`);
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.message?.includes('User already registered')) {
        toast.error("Cet email est déjà utilisé");
      } else {
        toast.error("Erreur lors de la création: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setDepartment("");
    setPhone("");
    setRole("user");
  };

  const getRoleLabel = (role: AppRole) => {
    switch (role) {
      case 'super_admin': return 'Super Administrateur';
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'user': return 'Utilisateur';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Créez un compte utilisateur avec les informations ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nom complet"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Département</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Département"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Numéro de téléphone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">{getRoleLabel('super_admin')}</SelectItem>
                <SelectItem value="admin">{getRoleLabel('admin')}</SelectItem>
                <SelectItem value="manager">{getRoleLabel('manager')}</SelectItem>
                <SelectItem value="user">{getRoleLabel('user')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'utilisateur"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
