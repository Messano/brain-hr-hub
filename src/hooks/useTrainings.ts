import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Training = Tables<"trainings">;
export type TrainingInsert = TablesInsert<"trainings">;
export type TrainingUpdate = TablesUpdate<"trainings">;

export function useTrainings() {
  return useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data as Training[];
    },
  });
}

export function useTraining(id: string | undefined) {
  return useQuery({
    queryKey: ["trainings", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Training;
    },
    enabled: !!id,
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (training: TrainingInsert) => {
      const { data, error } = await supabase
        .from("trainings")
        .insert(training)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success("Formation créée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...training }: TrainingUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("trainings")
        .update(training)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success("Formation mise à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    },
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trainings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success("Formation supprimée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });
}

export function useTrainingParticipants(trainingId: string | undefined) {
  return useQuery({
    queryKey: ["training_participants", trainingId],
    queryFn: async () => {
      if (!trainingId) return [];
      const { data, error } = await supabase
        .from("training_participants")
        .select("*")
        .eq("training_id", trainingId);

      if (error) throw error;
      return data;
    },
    enabled: !!trainingId,
  });
}
