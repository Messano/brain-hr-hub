import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TrainingParticipant = {
  id: string;
  training_id: string | null;
  personnel_id: string | null;
  candidate_id: string | null;
  completed: boolean | null;
  completion_date: string | null;
  created_at: string | null;
  personnel?: {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
  } | null;
};

export function useTrainingParticipants(trainingId: string | undefined) {
  return useQuery({
    queryKey: ["training_participants", trainingId],
    queryFn: async () => {
      if (!trainingId) return [];
      const { data, error } = await supabase
        .from("training_participants")
        .select("*, personnel(id, nom, prenom, matricule)")
        .eq("training_id", trainingId);

      if (error) throw error;
      return data as TrainingParticipant[];
    },
    enabled: !!trainingId,
  });
}

export function useAddTrainingParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ training_id, personnel_id }: { training_id: string; personnel_id: string }) => {
      const { data, error } = await supabase
        .from("training_participants")
        .insert({ training_id, personnel_id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["training_participants", variables.training_id] });
      toast.success("Participant ajouté avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout: " + error.message);
    },
  });
}

export function useRemoveTrainingParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, training_id }: { id: string; training_id: string }) => {
      const { error } = await supabase
        .from("training_participants")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { training_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["training_participants", data.training_id] });
      toast.success("Participant retiré avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });
}

export function useUpdateTrainingParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, training_id, completed, completion_date }: { id: string; training_id: string; completed: boolean; completion_date?: string | null }) => {
      const { data, error } = await supabase
        .from("training_participants")
        .update({ completed, completion_date })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, training_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["training_participants", result.training_id] });
      toast.success("Participant mis à jour");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });
}
