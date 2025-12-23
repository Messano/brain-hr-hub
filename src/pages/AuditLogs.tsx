import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Filter, Calendar, FileText, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useAuditLogs, 
  AuditLog, 
  getActionLabel, 
  getEntityTypeLabel,
  AuditAction,
  EntityType 
} from "@/hooks/useAuditLog";

const ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: 'create', label: 'Création' },
  { value: 'update', label: 'Modification' },
  { value: 'delete', label: 'Suppression' },
  { value: 'view', label: 'Consultation' },
  { value: 'login', label: 'Connexion' },
  { value: 'logout', label: 'Déconnexion' },
  { value: 'export', label: 'Export' },
  { value: 'import', label: 'Import' },
  { value: 'status_change', label: 'Changement de statut' },
  { value: 'role_change', label: 'Changement de rôle' },
];

const ENTITY_TYPE_OPTIONS: { value: EntityType; label: string }[] = [
  { value: 'client', label: 'Client' },
  { value: 'personnel', label: 'Personnel' },
  { value: 'contract', label: 'Contrat' },
  { value: 'invoice', label: 'Facture' },
  { value: 'mission', label: 'Mission' },
  { value: 'candidate', label: 'Candidat' },
  { value: 'job_offer', label: 'Offre d\'emploi' },
  { value: 'training', label: 'Formation' },
  { value: 'payroll', label: 'Paie' },
  { value: 'user', label: 'Utilisateur' },
  { value: 'event', label: 'Événement' },
  { value: 'report', label: 'Rapport' },
  { value: 'permission', label: 'Permission' },
];

function getActionBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  switch (action) {
    case 'create':
      return 'default';
    case 'update':
    case 'status_change':
    case 'role_change':
      return 'secondary';
    case 'delete':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | undefined>();
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [limit, setLimit] = useState(100);

  const { data: logs, isLoading, error } = useAuditLogs({
    action: actionFilter,
    entityType: entityTypeFilter,
    startDate,
    endDate,
    limit,
  });

  const filteredLogs = logs?.filter((log) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.user_name?.toLowerCase().includes(searchLower) ||
      log.user_email?.toLowerCase().includes(searchLower) ||
      log.entity_type.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.entity_id?.toLowerCase().includes(searchLower)
    );
  });

  const clearFilters = () => {
    setSearch("");
    setActionFilter(undefined);
    setEntityTypeFilter(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const exportLogs = () => {
    if (!filteredLogs) return;
    
    const csvContent = [
      ['Date', 'Utilisateur', 'Email', 'Action', 'Type', 'ID Entité'].join(';'),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss'),
        log.user_name || '-',
        log.user_email || '-',
        getActionLabel(log.action),
        getEntityTypeLabel(log.entity_type),
        log.entity_id || '-',
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Erreur lors du chargement des logs d'audit.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Journal d'audit</h1>
          <p className="text-muted-foreground mt-1">
            Historique des actions effectuées par les utilisateurs
          </p>
        </div>
        <Button onClick={exportLogs} disabled={!filteredLogs?.length}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Action Filter */}
            <Select
              value={actionFilter || "all"}
              onValueChange={(v) => setActionFilter(v === "all" ? undefined : v as AuditAction)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Entity Type Filter */}
            <Select
              value={entityTypeFilter || "all"}
              onValueChange={(v) => setEntityTypeFilter(v === "all" ? undefined : v as EntityType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {ENTITY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  {startDate ? format(startDate, 'dd/MM/yyyy') : 'Date début'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  {endDate ? format(endDate, 'dd/MM/yyyy') : 'Date fin'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {(search || actionFilter || entityTypeFilter || startDate || endDate) && (
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-16" /> : filteredLogs?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Total des logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-16" /> : filteredLogs?.filter(l => l.action === 'create').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Créations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-16" /> : filteredLogs?.filter(l => l.action === 'update').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Modifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-16" /> : filteredLogs?.filter(l => l.action === 'delete').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Suppressions</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>ID Entité</TableHead>
                  <TableHead className="w-[100px]">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Aucun log trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.user_name || 'Inconnu'}</p>
                          <p className="text-xs text-muted-foreground">{log.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getEntityTypeLabel(log.entity_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.entity_id ? log.entity_id.slice(0, 8) + '...' : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Load More */}
      {filteredLogs && filteredLogs.length >= limit && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setLimit(limit + 100)}>
            Charger plus
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedLog.created_at), 'dd MMMM yyyy à HH:mm:ss', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateur</p>
                  <p className="font-medium">{selectedLog.user_name || 'Inconnu'}</p>
                  <p className="text-xs text-muted-foreground">{selectedLog.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Action</p>
                  <Badge variant={getActionBadgeVariant(selectedLog.action)}>
                    {getActionLabel(selectedLog.action)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type d'entité</p>
                  <Badge variant="outline">
                    {getEntityTypeLabel(selectedLog.entity_type)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Entité</p>
                  <p className="font-mono text-sm">{selectedLog.entity_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User Agent</p>
                  <p className="text-xs truncate">{selectedLog.user_agent || '-'}</p>
                </div>
              </div>

              {selectedLog.old_data && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Données précédentes</p>
                  <ScrollArea className="h-32 rounded border p-2 bg-muted/50">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(selectedLog.old_data, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {selectedLog.new_data && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Nouvelles données</p>
                  <ScrollArea className="h-32 rounded border p-2 bg-muted/50">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(selectedLog.new_data, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
