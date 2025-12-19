import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserWithProfile, AppRole } from "@/hooks/useUsers";

interface UserFormProps {
  user: UserWithProfile | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: { userId: string; profile: Partial<UserWithProfile>; role?: AppRole }) => void;
  canEditRole: boolean;
}

export function UserForm({ user, open, onClose, onSave, canEditRole }: UserFormProps) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [role, setRole] = useState<AppRole>(user?.role || "user");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    onSave({
      userId: user.user_id,
      profile: {
        full_name: fullName,
        department,
        phone,
        is_active: isActive
      },
      role: canEditRole ? role : undefined
    });
    onClose();
  };

  const getRoleLabel = (role: AppRole) => {
    switch (role) {
      case 'super_admin': return 'Super Administrateur';
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'rh': return 'Ressources Humaines';
      case 'user': return 'Utilisateur';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nom complet"
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

          {canEditRole && (
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
                  <SelectItem value="rh">{getRoleLabel('rh')}</SelectItem>
                  <SelectItem value="user">{getRoleLabel('user')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Compte actif</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
