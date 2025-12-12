import { useState } from "react";
import { Plus, Search, Filter, Download, Eye, Calendar, Pencil, Trash2, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { PayrollForm } from "@/components/PayrollForm";
import { usePayrolls, useCreatePayroll, useUpdatePayroll, useDeletePayroll, usePayrollStats, PayrollWithPersonnel } from "@/hooks/usePayrolls";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function PayrollPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollWithPersonnel | null>(null);
  const [deletingPayroll, setDeletingPayroll] = useState<PayrollWithPersonnel | null>(null);
  const [viewingPayroll, setViewingPayroll] = useState<PayrollWithPersonnel | null>(null);

  const { data: payrolls, isLoading } = usePayrolls();
  const { data: stats } = usePayrollStats();
  const createPayroll = useCreatePayroll();
  const updatePayroll = useUpdatePayroll();
  const deletePayroll = useDeletePayroll();

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-success-foreground">Payé</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      case 'processing':
        return <Badge className="bg-primary text-primary-foreground">En cours</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number | string | null) => {
    if (!value) return "0 MAD";
    return `${Number(value).toLocaleString('fr-FR')} MAD`;
  };

  const getMonthLabel = (dateStr: string) => {
    return format(new Date(dateStr), "MMMM yyyy", { locale: fr });
  };

  const periods = [...new Set(payrolls?.map((p) => getMonthLabel(p.period_start)) || [])];

  const filteredPayrolls = payrolls?.filter((payroll) => {
    const monthLabel = getMonthLabel(payroll.period_start);
    const personnelName = payroll.personnel ? `${payroll.personnel.nom} ${payroll.personnel.prenom} ${payroll.personnel.matricule}` : "";
    const matchesSearch = monthLabel.toLowerCase().includes(search.toLowerCase()) || 
                          personnelName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || payroll.status === statusFilter;
    const matchesPeriod = periodFilter === "all" || monthLabel === periodFilter;
    return matchesSearch && matchesStatus && matchesPeriod;
  }) || [];

  const handleSubmit = async (data: any) => {
    if (editingPayroll) {
      await updatePayroll.mutateAsync({ id: editingPayroll.id, ...data });
    } else {
      await createPayroll.mutateAsync(data);
    }
    setIsFormOpen(false);
    setEditingPayroll(null);
  };

  const handleDelete = async () => {
    if (deletingPayroll) {
      await deletePayroll.mutateAsync(deletingPayroll.id);
      setDeletingPayroll(null);
    }
  };

  const handleEdit = (payroll: PayrollWithPersonnel) => {
    setEditingPayroll(payroll);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paie</h1>
          <p className="text-muted-foreground">Gestion des bulletins de paie et traitements</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button className="flex items-center space-x-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Nouveau bulletin</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Bulletins générés"
          value={stats?.total.toString() || "0"}
          icon={Calendar}
        />
        <KPICard
          title="Payés"
          value={stats?.paid.toString() || "0"}
          change={stats?.total ? `${Math.round((stats.paid / stats.total) * 100)}% traités` : "0%"}
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="En attente"
          value={((stats?.pending || 0) + (stats?.processing || 0)).toString()}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Masse salariale"
          value={stats?.totalMass ? `${(stats.totalMass / 1000).toFixed(0)}K MAD` : "0 MAD"}
          icon={DollarSign}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payrolls List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPayrolls.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun bulletin de paie trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPayrolls.map((payroll) => (
            <Card key={payroll.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      {payroll.personnel 
                        ? `${payroll.personnel.nom} ${payroll.personnel.prenom}`
                        : "Employé non assigné"}
                    </h3>
                    {payroll.personnel && (
                      <p className="text-xs text-muted-foreground">{payroll.personnel.matricule}</p>
                    )}
                    <p className="text-muted-foreground text-sm capitalize">
                      {getMonthLabel(payroll.period_start)} • Du {format(new Date(payroll.period_start), "d MMM", { locale: fr })} au {format(new Date(payroll.period_end), "d MMM yyyy", { locale: fr })}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {payroll.payment_date && (
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Payé le {format(new Date(payroll.payment_date), "d MMMM yyyy", { locale: fr })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Brut: {formatCurrency(payroll.base_salary)}</p>
                      {payroll.bonus && Number(payroll.bonus) > 0 && (
                        <p className="text-sm text-success">+ Primes: {formatCurrency(payroll.bonus)}</p>
                      )}
                      {payroll.deductions && Number(payroll.deductions) > 0 && (
                        <p className="text-sm text-destructive">- Retenues: {formatCurrency(payroll.deductions)}</p>
                      )}
                      <p className="font-semibold text-lg text-success">Net: {formatCurrency(payroll.net_salary)}</p>
                    </div>
                    {getStatusBadge(payroll.status)}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setViewingPayroll(payroll)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(payroll)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeletingPayroll(payroll)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
        if (!open) setEditingPayroll(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPayroll ? "Modifier le bulletin de paie" : "Nouveau bulletin de paie"}
            </DialogTitle>
          </DialogHeader>
          <PayrollForm
            payroll={editingPayroll || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingPayroll(null);
            }}
            isLoading={createPayroll.isPending || updatePayroll.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingPayroll} onOpenChange={(open) => !open && setViewingPayroll(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulletin de paie - {viewingPayroll && getMonthLabel(viewingPayroll.period_start)}</DialogTitle>
          </DialogHeader>
          {viewingPayroll && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(viewingPayroll.status)}
              </div>
              {viewingPayroll.personnel && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <span className="font-medium">Employé:</span>
                  <p className="text-muted-foreground">
                    {viewingPayroll.personnel.matricule} - {viewingPayroll.personnel.nom} {viewingPayroll.personnel.prenom}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Période:</span>
                  <p className="text-muted-foreground">
                    {format(new Date(viewingPayroll.period_start), "d MMMM", { locale: fr })} - {format(new Date(viewingPayroll.period_end), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                {viewingPayroll.payment_date && (
                  <div>
                    <span className="font-medium">Date de paiement:</span>
                    <p className="text-muted-foreground">{format(new Date(viewingPayroll.payment_date), "d MMMM yyyy", { locale: fr })}</p>
                  </div>
                )}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Salaire de base:</span>
                  <span className="font-medium">{formatCurrency(viewingPayroll.base_salary)}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Primes:</span>
                  <span className="font-medium">+ {formatCurrency(viewingPayroll.bonus)}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Retenues:</span>
                  <span className="font-medium">- {formatCurrency(viewingPayroll.deductions)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Salaire net:</span>
                  <span className="text-success">{formatCurrency(viewingPayroll.net_salary)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPayroll} onOpenChange={(open) => !open && setDeletingPayroll(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce bulletin de paie ?
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
