import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Event = Tables<"events">;
export type EventInsert = TablesInsert<"events">;
export type EventUpdate = TablesUpdate<"events">;

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_datetime", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useEventsByDateRange(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ["events", "range", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("start_datetime", startDate.toISOString())
        .lte("start_datetime", endDate.toISOString())
        .order("start_datetime", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: EventInsert) => {
      const { data, error } = await supabase
        .from("events")
        .insert(event)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement créé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de l'événement");
      console.error(error);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...event }: EventUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("events")
        .update(event)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de l'événement");
      console.error(error);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression de l'événement");
      console.error(error);
    },
  });
}
