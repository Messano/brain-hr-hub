import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  useInvoice,
  useInvoiceLines,
  useUpdateInvoice,
  useCreateInvoiceLine,
  useDeleteInvoiceLine,
  InvoiceStatus,
} from "@/hooks/useInvoices";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Building2,
  Calendar,
  Euro,
  FileText,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const getStatusBadge = (status: InvoiceStatus) => {
  const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    draft: { label: "Brouillon", variant: "secondary" },
    pending: { label: "En attente", variant: "outline" },
    sent: { label: "Envoyée", variant: "default" },
    paid: { label: "Payée", variant: "default" },
    cancelled: { label: "Annulée", variant: "destructive" },
  };
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
  }).format(amount);
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [addLineOpen, setAddLineOpen] = useState(false);
  const [newLine, setNewLine] = useState({
    personnel_id: "",
    heures_normales: 0,
    heures_sup_25: 0,
    heures_sup_50: 0,
    heures_sup_100: 0,
    heures_feriees: 0,
    indemnites_soumises: 0,
    indemnites_non_soumises: 0,
    conge_paye: 0,
    prime: 0,
    montant_ht: 0,
    description: "",
  });

  const { data: invoice, isLoading: invoiceLoading } = useInvoice(id);
  const { data: lines, isLoading: linesLoading } = useInvoiceLines(id);
  const updateInvoice = useUpdateInvoice();
  const createLine = useCreateInvoiceLine();
  const deleteLine = useDeleteInvoiceLine();

  // Fetch personnel for adding lines
  const { data: personnel } = useQuery({
    queryKey: ["personnel-select"],
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

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (id) {
      const updates: { id: string; status: InvoiceStatus; payment_date?: string } = {
        id,
        status: newStatus,
      };
      if (newStatus === "paid") {
        updates.payment_date = new Date().toISOString().split("T")[0];
      }
      await updateInvoice.mutateAsync(updates);
    }
  };

  const handleAddLine = async () => {
    if (!id) return;
    await createLine.mutateAsync({
      invoice_id: id,
      personnel_id: newLine.personnel_id || null,
      contract_id: null,
      ...newLine,
    });
    setAddLineOpen(false);
    setNewLine({
      personnel_id: "",
      heures_normales: 0,
      heures_sup_25: 0,
      heures_sup_50: 0,
      heures_sup_100: 0,
      heures_feriees: 0,
      indemnites_soumises: 0,
      indemnites_non_soumises: 0,
      conge_paye: 0,
      prime: 0,
      montant_ht: 0,
      description: "",
    });
  };

  const handleDeleteLine = async (lineId: string) => {
    if (id) {
      await deleteLine.mutateAsync({ id: lineId, invoiceId: id });
    }
  };

  if (invoiceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Facture non trouvée</h2>
        <Button variant="link" onClick={() => navigate("/admin/invoices")}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/invoices")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
            {getStatusBadge(invoice.status as InvoiceStatus)}
          </div>
          <p className="text-muted-foreground">
            {invoice.clients?.raison_sociale}
          </p>
        </div>
        <Select
          value={invoice.status}
          onValueChange={(value) => handleStatusChange(value as InvoiceStatus)}
        >
          <SelectTrigger className="w-40">
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Invoice Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Numéro</Label>
              <p className="font-medium">{invoice.invoice_number}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Date d'émission</Label>
              <p className="font-medium">
                {format(new Date(invoice.issue_date), "dd MMMM yyyy", { locale: fr })}
              </p>
            </div>
            {invoice.due_date && (
              <div>
                <Label className="text-muted-foreground">Date d'échéance</Label>
                <p className="font-medium">
                  {format(new Date(invoice.due_date), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            )}
            {invoice.payment_date && (
              <div>
                <Label className="text-muted-foreground">Date de paiement</Label>
                <p className="font-medium text-green-600">
                  {format(new Date(invoice.payment_date), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Raison sociale</Label>
              <p className="font-medium">{invoice.clients?.raison_sociale}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Code</Label>
              <p className="font-medium">{invoice.clients?.code}</p>
            </div>
            {invoice.clients?.code_ice && (
              <div>
                <Label className="text-muted-foreground">Code ICE</Label>
                <p className="font-medium">{invoice.clients?.code_ice}</p>
              </div>
            )}
            {invoice.clients?.adresse_facturation && (
              <div>
                <Label className="text-muted-foreground">Adresse de facturation</Label>
                <p className="text-sm">{invoice.clients?.adresse_facturation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Montants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-muted-foreground">Total HT</Label>
              <p className="font-medium">{formatCurrency(Number(invoice.total_ht))}</p>
            </div>
            <div className="flex justify-between">
              <Label className="text-muted-foreground">TVA</Label>
              <p className="font-medium">{formatCurrency(Number(invoice.total_tva))}</p>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <Label className="font-semibold">Total TTC</Label>
              <p className="font-bold text-lg">{formatCurrency(Number(invoice.total_ttc))}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Période de facturation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Du{" "}
            <span className="font-medium">
              {format(new Date(invoice.period_start), "dd MMMM yyyy", { locale: fr })}
            </span>{" "}
            au{" "}
            <span className="font-medium">
              {format(new Date(invoice.period_end), "dd MMMM yyyy", { locale: fr })}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Invoice Lines */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lignes de facturation</CardTitle>
          <Dialog open={addLineOpen} onOpenChange={setAddLineOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter une ligne de facturation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Intérimaire</Label>
                  <Select
                    value={newLine.personnel_id}
                    onValueChange={(value) =>
                      setNewLine((prev) => ({ ...prev, personnel_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un intérimaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {personnel?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.matricule} - {p.nom} {p.prenom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heures normales</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newLine.heures_normales}
                      onChange={(e) =>
                        setNewLine((prev) => ({
                          ...prev,
                          heures_normales: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heures sup. 25%</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newLine.heures_sup_25}
                      onChange={(e) =>
                        setNewLine((prev) => ({
                          ...prev,
                          heures_sup_25: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heures sup. 50%</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newLine.heures_sup_50}
                      onChange={(e) =>
                        setNewLine((prev) => ({
                          ...prev,
                          heures_sup_50: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heures sup. 100%</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newLine.heures_sup_100}
                      onChange={(e) =>
                        setNewLine((prev) => ({
                          ...prev,
                          heures_sup_100: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heures fériées</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newLine.heures_feriees}
                      onChange={(e) =>
                        setNewLine((prev) => ({
                          ...prev,
                          heures_feriees: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Montant HT</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newLine.montant_ht}
                      onChange={(e) =>
                        setNewLine((prev) => ({
                          ...prev,
                          montant_ht: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Indemnités soumises</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newLine.indemnites_soumises}
                      onChange={(e) =>
                        setNewLine((prev) => ({
                          ...prev,
                          indemnites_soumises: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Indemnités non soumises</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newLine.indemnites_non_soumises}
                      onChange={(e) =>
                        setNewLine((prev) => ({
                          ...prev,
                          indemnites_non_soumises: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Congés payés</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newLine.conge_paye}
                      onChange={(e) =>
                        setNewLine((prev) => ({
                          ...prev,
                          conge_paye: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prime</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newLine.prime}
                      onChange={(e) =>
                        setNewLine((prev) => ({
                          ...prev,
                          prime: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newLine.description}
                    onChange={(e) =>
                      setNewLine((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Description de la ligne..."
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setAddLineOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddLine} disabled={createLine.isPending}>
                  {createLine.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {linesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : lines && lines.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intérimaire</TableHead>
                  <TableHead className="text-right">H. Norm.</TableHead>
                  <TableHead className="text-right">H. Sup 25%</TableHead>
                  <TableHead className="text-right">H. Sup 50%</TableHead>
                  <TableHead className="text-right">Montant HT</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      {line.personnel
                        ? `${line.personnel.matricule} - ${line.personnel.nom} ${line.personnel.prenom}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">{line.heures_normales}</TableCell>
                    <TableCell className="text-right">{line.heures_sup_25}</TableCell>
                    <TableCell className="text-right">{line.heures_sup_50}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(line.montant_ht))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLine(line.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune ligne de facturation
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
