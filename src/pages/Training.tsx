import { useState } from "react";
import { Plus, Search, Filter, Play, BookOpen, Users, Clock, Pencil, Trash2, Eye, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KPICard } from "@/components/KPICard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrainingForm } from "@/components/TrainingForm";
import { useTrainings, useCreateTraining, useUpdateTraining, useDeleteTraining, Training } from "@/hooks/useTrainings";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrainingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [deletingTraining, setDeletingTraining] = useState<Training | null>(null);
  const [viewingTraining, setViewingTraining] = useState<Training | null>(null);

  const { data: trainings, isLoading } = useTrainings();
  const createTraining = useCreateTraining();
  const updateTraining = useUpdateTraining();
  const deleteTraining = useDeleteTraining();

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-success text-success-foreground">En cours</Badge>;
      case 'completed':
        return <Badge variant="outline">Terminée</Badge>;
      case 'planned':
        return <Badge className="bg-primary text-primary-foreground">Planifiée</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTrainings = trainings?.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(search.toLowerCase()) ||
      training.description?.toLowerCase().includes(search.toLowerCase()) ||
      training.trainer?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || training.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || training.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const stats = {
    total: trainings?.length || 0,
    active: trainings?.filter((t) => t.status === "in_progress").length || 0,
    planned: trainings?.filter((t) => t.status === "planned").length || 0,
    completed: trainings?.filter((t) => t.status === "completed").length || 0,
    totalHours: trainings?.reduce((sum, t) => sum + (t.duration_hours || 0), 0) || 0,
  };

  const categories = [...new Set(trainings?.map((t) => t.category).filter(Boolean) || [])];

  const handleSubmit = async (data: any) => {
    if (editingTraining) {
      await updateTraining.mutateAsync({ id: editingTraining.id, ...data });
    } else {
      await createTraining.mutateAsync(data);
    }
    setIsFormOpen(false);
    setEditingTraining(null);
  };

  const handleDelete = async () => {
    if (deletingTraining) {
      await deleteTraining.mutateAsync(deletingTraining.id);
      setDeletingTraining(null);
    }
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Formations</h1>
          <p className="text-muted-foreground">Gérez les parcours de formation et le développement des compétences</p>
        </div>
        <Button className="flex items-center space-x-2" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Nouvelle formation</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Formations actives"
          value={stats.active.toString()}
          icon={BookOpen}
          variant="success"
        />
        <KPICard
          title="Formations planifiées"
          value={stats.planned.toString()}
          icon={Users}
        />
        <KPICard
          title="Formations terminées"
          value={stats.completed.toString()}
          icon={Play}
          variant="success"
        />
        <KPICard
          title="Heures totales"
          value={`${stats.totalHours}h`}
          icon={Clock}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher une formation..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="planned">Planifiée</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainings List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTrainings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune formation trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTrainings.map((training) => (
            <Card key={training.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{training.title}</CardTitle>
                      {training.category && (
                        <Badge variant="secondary" className="text-xs">{training.category}</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{training.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {training.trainer && (
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {training.trainer}
                        </span>
                      )}
                      {training.max_participants && (
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {training.max_participants} participants max
                        </span>
                      )}
                      {training.duration_hours && (
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {training.duration_hours}h
                        </span>
                      )}
                      {training.location && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {training.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(training.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Du {format(new Date(training.start_date), "d MMMM yyyy", { locale: fr })}
                      {training.end_date && ` au ${format(new Date(training.end_date), "d MMMM yyyy", { locale: fr })}`}
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingTraining(training)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(training)}>
                        <Pencil className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeletingTraining(training)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingTraining(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTraining ? "Modifier la formation" : "Nouvelle formation"}
            </DialogTitle>
          </DialogHeader>
          <TrainingForm
            training={editingTraining || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingTraining(null);
            }}
            isLoading={createTraining.isPending || updateTraining.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingTraining} onOpenChange={(open) => !open && setViewingTraining(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingTraining?.title}</DialogTitle>
          </DialogHeader>
          {viewingTraining && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(viewingTraining.status)}
                {viewingTraining.category && <Badge variant="secondary">{viewingTraining.category}</Badge>}
              </div>
              <p className="text-muted-foreground">{viewingTraining.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Date de début:</span>
                  <p className="text-muted-foreground">{format(new Date(viewingTraining.start_date), "d MMMM yyyy", { locale: fr })}</p>
                </div>
                {viewingTraining.end_date && (
                  <div>
                    <span className="font-medium">Date de fin:</span>
                    <p className="text-muted-foreground">{format(new Date(viewingTraining.end_date), "d MMMM yyyy", { locale: fr })}</p>
                  </div>
                )}
                {viewingTraining.duration_hours && (
                  <div>
                    <span className="font-medium">Durée:</span>
                    <p className="text-muted-foreground">{viewingTraining.duration_hours} heures</p>
                  </div>
                )}
                {viewingTraining.max_participants && (
                  <div>
                    <span className="font-medium">Participants max:</span>
                    <p className="text-muted-foreground">{viewingTraining.max_participants}</p>
                  </div>
                )}
                {viewingTraining.trainer && (
                  <div>
                    <span className="font-medium">Formateur:</span>
                    <p className="text-muted-foreground">{viewingTraining.trainer}</p>
                  </div>
                )}
                {viewingTraining.location && (
                  <div>
                    <span className="font-medium">Lieu:</span>
                    <p className="text-muted-foreground">{viewingTraining.location}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTraining} onOpenChange={(open) => !open && setDeletingTraining(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la formation "{deletingTraining?.title}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
