import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Database, Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format as formatDate } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const TABLES = [
  { id: "clients", label: "Clients", description: "Entreprises clientes", dateColumn: "created_at" },
  { id: "personnel", label: "Personnel", description: "Intérimaires et employés", dateColumn: "created_at" },
  { id: "contracts", label: "Contrats", description: "Contrats de travail temporaire", dateColumn: "created_at" },
  { id: "missions", label: "Missions", description: "Missions actives et terminées", dateColumn: "created_at" },
  { id: "job_offers", label: "Offres d'emploi", description: "Annonces de recrutement", dateColumn: "created_at" },
  { id: "candidates", label: "Candidats", description: "Candidatures reçues", dateColumn: "applied_at" },
  { id: "invoices", label: "Factures", description: "Factures clients", dateColumn: "created_at" },
  { id: "invoice_lines", label: "Lignes de facture", description: "Détails des factures", dateColumn: "created_at" },
  { id: "payrolls", label: "Paies", description: "Bulletins de paie", dateColumn: "created_at" },
  { id: "trainings", label: "Formations", description: "Sessions de formation", dateColumn: "created_at" },
  { id: "training_participants", label: "Participants formations", description: "Inscriptions aux formations", dateColumn: "created_at" },
];

type ExportFormat = "json" | "csv" | "sql";

export function DataExport() {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [format, setFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const toggleTable = (tableId: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAll = () => {
    setSelectedTables(TABLES.map((t) => t.id));
  };

  const deselectAll = () => {
    setSelectedTables([]);
  };

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const convertToCSV = (data: Record<string, unknown>[]): string => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => {
        const value = row[h];
        if (value === null || value === undefined) return "";
        const str = String(value);
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const escapeSQL = (value: unknown): string => {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    if (Array.isArray(value)) return `ARRAY[${value.map(v => escapeSQL(v)).join(",")}]`;
    if (typeof value === "object") return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    return `'${String(value).replace(/'/g, "''")}'`;
  };

  const convertToSQL = (tableName: string, data: Record<string, unknown>[]): string => {
    if (data.length === 0) return "";
    const columns = Object.keys(data[0]);
    const inserts = data.map((row) => {
      const values = columns.map((col) => escapeSQL(row[col]));
      return `INSERT INTO public.${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")});`;
    });
    return inserts.join("\n");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (selectedTables.length === 0) {
      toast.error("Veuillez sélectionner au moins une table");
      return;
    }

    setIsExporting(true);
    try {
      const exportData: Record<string, unknown[]> = {};

      for (const tableId of selectedTables) {
        const tableConfig = TABLES.find(t => t.id === tableId);
        let query = supabase.from(tableId as any).select("*");
        
        // Apply date filter if dates are set
        if (startDate && tableConfig?.dateColumn) {
          query = query.gte(tableConfig.dateColumn, startDate.toISOString());
        }
        if (endDate && tableConfig?.dateColumn) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          query = query.lte(tableConfig.dateColumn, endOfDay.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          console.error(`Error exporting ${tableId}:`, error);
          toast.error(`Erreur lors de l'export de ${tableId}`);
          continue;
        }

        exportData[tableId] = data || [];
      }

      const timestamp = new Date().toISOString().split("T")[0];

      if (format === "json") {
        const jsonContent = JSON.stringify(exportData, null, 2);
        downloadFile(jsonContent, `braincrm-export-${timestamp}.json`, "application/json");
      } else if (format === "csv") {
        // Combine all tables into a single CSV file with section markers
        let combinedCsv = "";
        for (const [tableName, tableData] of Object.entries(exportData)) {
          if (tableData.length > 0) {
            combinedCsv += `\n=== ${tableName.toUpperCase()} ===\n`;
            combinedCsv += convertToCSV(tableData as Record<string, unknown>[]);
            combinedCsv += "\n";
          }
        }
        downloadFile(combinedCsv.trim(), `braincrm-export-${timestamp}.csv`, "text/csv");
      } else {
        // SQL format
        let sqlContent = `-- BrainCRM Database Export\n-- Generated: ${new Date().toISOString()}\n-- Tables: ${selectedTables.join(", ")}\n\n`;
        for (const [tableName, tableData] of Object.entries(exportData)) {
          if (tableData.length > 0) {
            sqlContent += `-- Table: ${tableName}\n`;
            sqlContent += convertToSQL(tableName, tableData as Record<string, unknown>[]);
            sqlContent += "\n\n";
          }
        }
        downloadFile(sqlContent.trim(), `braincrm-export-${timestamp}.sql`, "application/sql");
      }

      toast.success("Export terminé avec succès");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export des données</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <Label>Format d'export</Label>
          <RadioGroup
            value={format}
            onValueChange={(value) => setFormat(value as ExportFormat)}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="format-json" />
              <Label htmlFor="format-json" className="flex items-center gap-2 cursor-pointer">
                <FileJson className="w-4 h-4" />
                JSON
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="format-csv" />
              <Label htmlFor="format-csv" className="flex items-center gap-2 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sql" id="format-sql" />
              <Label htmlFor="format-sql" className="flex items-center gap-2 cursor-pointer">
                <Database className="w-4 h-4" />
                SQL
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Date Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Filtrer par date (optionnel)</Label>
            {(startDate || endDate) && (
              <Button variant="ghost" size="sm" onClick={clearDateFilter}>
                Effacer
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? formatDate(startDate, "dd/MM/yyyy", { locale: fr }) : "Date début"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? formatDate(endDate, "dd/MM/yyyy", { locale: fr }) : "Date fin"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Table Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Tables à exporter</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Tout sélectionner
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Tout désélectionner
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {TABLES.map((table) => (
              <div
                key={table.id}
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={table.id}
                  checked={selectedTables.includes(table.id)}
                  onCheckedChange={() => toggleTable(table.id)}
                />
                <div className="space-y-1">
                  <Label htmlFor={table.id} className="cursor-pointer font-medium">
                    {table.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{table.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || selectedTables.length === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Export en cours...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Exporter {selectedTables.length} table(s) en {format.toUpperCase()}
            </>
          )}
        </Button>

        <p className="text-sm text-muted-foreground">
          Les données exportées incluront toutes les entrées de chaque table sélectionnée dans un seul fichier.
        </p>
      </CardContent>
    </Card>
  );
}
