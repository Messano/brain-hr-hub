import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { KPICard } from "@/components/KPICard";
import { InvoiceForm, InvoiceFormData } from "@/components/InvoiceForm";
import {
  useInvoices,
  useCreateInvoice,
  useDeleteInvoice,
  useInvoiceStats,
  InvoiceStatus,
  InvoiceInsert,
} from "@/hooks/useInvoices";
import {
  Plus,
  Search,
  FileText,
  Clock,
  Send,
  CheckCircle,
  Euro,
  Loader2,
  Eye,
  Trash2,
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

export default function Invoices() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: invoices, isLoading } = useInvoices();
  const { data: stats } = useInvoiceStats();
  const createInvoice = useCreateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clients?.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clients?.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    const invoiceData: InvoiceInsert = {
      client_id: data.client_id,
      period_start: data.period_start,
      period_end: data.period_end,
      total_ht: data.total_ht,
      total_tva: data.total_tva,
      total_ttc: data.total_ttc,
      status: data.status,
      issue_date: data.issue_date,
      due_date: data.due_date,
      notes: data.notes,
    };
    await createInvoice.mutateAsync(invoiceData);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteInvoice.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturation</h1>
          <p className="text-muted-foreground">
            Gestion des factures clients
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une facture</DialogTitle>
            </DialogHeader>
            <InvoiceForm
              onSubmit={handleCreateInvoice}
              isSubmitting={createInvoice.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Total factures"
          value={stats?.total || 0}
          icon={FileText}
        />
        <KPICard
          title="Brouillons"
          value={stats?.draft || 0}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Envoyées"
          value={stats?.sent || 0}
          icon={Send}
        />
        <KPICard
          title="Payées"
          value={stats?.paid || 0}
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="CA Total TTC"
          value={formatCurrency(stats?.totalTTC || 0)}
          icon={Euro}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices List */}
          {filteredInvoices && filteredInvoices.length > 0 ? (
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{invoice.invoice_number}</span>
                      {getStatusBadge(invoice.status as InvoiceStatus)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.clients?.code} - {invoice.clients?.raison_sociale}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Période: {format(new Date(invoice.period_start), "dd/MM/yyyy", { locale: fr })} -{" "}
                      {format(new Date(invoice.period_end), "dd/MM/yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-lg">
                      {formatCurrency(Number(invoice.total_ttc))}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      HT: {formatCurrency(Number(invoice.total_ht))}
                    </span>
                    {invoice.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Échéance: {format(new Date(invoice.due_date), "dd/MM/yyyy", { locale: fr })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(invoice.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Aucune facture</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Aucune facture ne correspond à vos critères"
                  : "Créez votre première facture"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
