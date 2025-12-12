import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { InvoiceStatus } from "@/hooks/useInvoices";

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
  initialData?: Partial<InvoiceFormData>;
  isSubmitting?: boolean;
}

export interface InvoiceFormData {
  client_id: string;
  period_start: string;
  period_end: string;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  notes: string | null;
}

export function InvoiceForm({ onSubmit, initialData, isSubmitting }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: initialData?.client_id || "",
    period_start: initialData?.period_start || "",
    period_end: initialData?.period_end || "",
    total_ht: initialData?.total_ht || 0,
    total_tva: initialData?.total_tva || 0,
    total_ttc: initialData?.total_ttc || 0,
    status: initialData?.status || "draft",
    issue_date: initialData?.issue_date || new Date().toISOString().split("T")[0],
    due_date: initialData?.due_date || null,
    notes: initialData?.notes || null,
  });

  // Fetch clients
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, raison_sociale, code, delai_reglement, tva")
        .eq("is_active", true)
        .order("raison_sociale");
      if (error) throw error;
      return data;
    },
  });

  // Calculate due date based on client's delai_reglement
  useEffect(() => {
    if (formData.client_id && formData.issue_date) {
      const client = clients?.find((c) => c.id === formData.client_id);
      if (client && client.delai_reglement) {
        const issueDate = new Date(formData.issue_date);
        issueDate.setDate(issueDate.getDate() + client.delai_reglement);
        setFormData((prev) => ({
          ...prev,
          due_date: issueDate.toISOString().split("T")[0],
        }));
      }
    }
  }, [formData.client_id, formData.issue_date, clients]);

  // Calculate TVA and TTC
  useEffect(() => {
    const client = clients?.find((c) => c.id === formData.client_id);
    let tvaRate = 0.2; // Default 20%
    if (client?.tva === "exoneree") tvaRate = 0;
    else if (client?.tva === "reduite") tvaRate = 0.1;

    const tva = formData.total_ht * tvaRate;
    const ttc = formData.total_ht + tva;
    setFormData((prev) => ({
      ...prev,
      total_tva: Math.round(tva * 100) / 100,
      total_ttc: Math.round(ttc * 100) / 100,
    }));
  }, [formData.total_ht, formData.client_id, clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof InvoiceFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Selection */}
      <div className="space-y-2">
        <Label htmlFor="client_id">Client *</Label>
        <Select
          value={formData.client_id}
          onValueChange={(value) => handleChange("client_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            {clientsLoading ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.code} - {client.raison_sociale}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Period */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="period_start">Début de période *</Label>
          <Input
            id="period_start"
            type="date"
            value={formData.period_start}
            onChange={(e) => handleChange("period_start", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="period_end">Fin de période *</Label>
          <Input
            id="period_end"
            type="date"
            value={formData.period_end}
            onChange={(e) => handleChange("period_end", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="issue_date">Date d'émission *</Label>
          <Input
            id="issue_date"
            type="date"
            value={formData.issue_date}
            onChange={(e) => handleChange("issue_date", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Date d'échéance</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date || ""}
            onChange={(e) => handleChange("due_date", e.target.value || null)}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="total_ht">Total HT (MAD) *</Label>
          <Input
            id="total_ht"
            type="number"
            step="0.01"
            min="0"
            value={formData.total_ht}
            onChange={(e) => handleChange("total_ht", parseFloat(e.target.value) || 0)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_tva">TVA (MAD)</Label>
          <Input
            id="total_tva"
            type="number"
            step="0.01"
            value={formData.total_tva}
            readOnly
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_ttc">Total TTC (MAD)</Label>
          <Input
            id="total_ttc"
            type="number"
            step="0.01"
            value={formData.total_ttc}
            readOnly
            className="bg-muted"
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Statut</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange("status", value as InvoiceStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="sent">Envoyée</SelectItem>
            <SelectItem value="paid">Payée</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value || null)}
          rows={3}
          placeholder="Notes internes..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Mettre à jour" : "Créer la facture"}
      </Button>
    </form>
  );
}
