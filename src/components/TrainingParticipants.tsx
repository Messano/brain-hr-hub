import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, UserCheck, UserX } from "lucide-react";
import {
  useTrainingParticipants,
  useAddTrainingParticipant,
  useRemoveTrainingParticipant,
  useUpdateTrainingParticipant,
} from "@/hooks/useTrainingParticipants";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TrainingParticipantsProps {
  trainingId: string;
  maxParticipants?: number | null;
}

export function TrainingParticipants({ trainingId, maxParticipants }: TrainingParticipantsProps) {
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>("");

  const { data: participants, isLoading } = useTrainingParticipants(trainingId);
  const addParticipant = useAddTrainingParticipant();
  const removeParticipant = useRemoveTrainingParticipant();
  const updateParticipant = useUpdateTrainingParticipant();

  const { data: allPersonnel } = useQuery({
    queryKey: ["personnel-for-training"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personnel")
        .select("id, nom, prenom, matricule")
        .eq("is_active", true)
        .order("nom");
      if (error) throw error;
      return data;
    },
  });

  const participantPersonnelIds = participants?.map((p) => p.personnel_id) || [];
  const availablePersonnel = allPersonnel?.filter(
    (p) => !participantPersonnelIds.includes(p.id)
  );

  const handleAddParticipant = () => {
    if (!selectedPersonnelId) return;
    addParticipant.mutate(
      { training_id: trainingId, personnel_id: selectedPersonnelId },
      {
        onSuccess: () => setSelectedPersonnelId(""),
      }
    );
  };

  const handleRemoveParticipant = (id: string) => {
    removeParticipant.mutate({ id, training_id: trainingId });
  };

  const handleToggleCompleted = (id: string, currentCompleted: boolean) => {
    updateParticipant.mutate({
      id,
      training_id: trainingId,
      completed: !currentCompleted,
      completion_date: !currentCompleted ? new Date().toISOString().split("T")[0] : null,
    });
  };

  const isAtCapacity = maxParticipants ? (participants?.length || 0) >= maxParticipants : false;
  const completedCount = participants?.filter((p) => p.completed).length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">Participants</h4>
          <Badge variant="secondary">
            {participants?.length || 0}
            {maxParticipants && ` / ${maxParticipants}`}
          </Badge>
          {completedCount > 0 && (
            <Badge className="bg-success text-success-foreground">
              {completedCount} certifié(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Add participant */}
      <div className="flex items-center gap-2">
        <Select
          value={selectedPersonnelId}
          onValueChange={setSelectedPersonnelId}
          disabled={isAtCapacity}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder={isAtCapacity ? "Capacité max atteinte" : "Sélectionner un personnel"} />
          </SelectTrigger>
          <SelectContent>
            {availablePersonnel?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.matricule} - {p.nom} {p.prenom}
              </SelectItem>
            ))}
            {availablePersonnel?.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Aucun personnel disponible
              </div>
            )}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={handleAddParticipant}
          disabled={!selectedPersonnelId || addParticipant.isPending || isAtCapacity}
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Participants list */}
      {isLoading ? (
        <div className="text-muted-foreground text-sm">Chargement...</div>
      ) : participants?.length === 0 ? (
        <div className="text-muted-foreground text-sm py-4 text-center border rounded-md">
          Aucun participant inscrit
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matricule</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead className="text-center">Certifié</TableHead>
              <TableHead>Date certification</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants?.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-mono text-sm">
                  {participant.personnel?.matricule}
                </TableCell>
                <TableCell>{participant.personnel?.nom}</TableCell>
                <TableCell>{participant.personnel?.prenom}</TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={participant.completed || false}
                    onCheckedChange={() =>
                      handleToggleCompleted(participant.id, participant.completed || false)
                    }
                  />
                </TableCell>
                <TableCell>
                  {participant.completion_date
                    ? format(new Date(participant.completion_date), "d MMM yyyy", { locale: fr })
                    : "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveParticipant(participant.id)}
                    disabled={removeParticipant.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
