import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Payroll = Tables<"payrolls">;
export type PayrollInsert = TablesInsert<"payrolls">;
export type PayrollUpdate = TablesUpdate<"payrolls">;

export function usePayrolls() {
  return useQuery({
    queryKey: ["payrolls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payrolls")
        .select("*")
        .order("period_start", { ascending: false });

      if (error) throw error;
      return data as Payroll[];
    },
  });
}

export function usePayroll(id: string | undefined) {
  return useQuery({
    queryKey: ["payrolls", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("payrolls")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Payroll;
    },
    enabled: !!id,
  });
}

export function useCreatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payroll: PayrollInsert) => {
      const { data, error } = await supabase
        .from("payrolls")
        .insert(payroll)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      toast.success("Bulletin de paie créé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });
}

export function useUpdatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payroll }: PayrollUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("payrolls")
        .update(payroll)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      toast.success("Bulletin de paie mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    },
  });
}

export function useDeletePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payrolls").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      toast.success("Bulletin de paie supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });
}

export function usePayrollStats() {
  return useQuery({
    queryKey: ["payroll-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payrolls").select("*");
      if (error) throw error;

      const total = data.length;
      const paid = data.filter((p) => p.status === "paid").length;
      const pending = data.filter((p) => p.status === "pending").length;
      const processing = data.filter((p) => p.status === "processing").length;
      const totalMass = data.reduce((sum, p) => sum + Number(p.net_salary || 0), 0);

      return { total, paid, pending, processing, totalMass };
    },
  });
}
