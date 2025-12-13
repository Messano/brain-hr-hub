import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TABLES = [
  { id: "clients", label: "Clients", description: "Entreprises clientes" },
  { id: "personnel", label: "Personnel", description: "Intérimaires et employés" },
  { id: "contracts", label: "Contrats", description: "Contrats de travail temporaire" },
  { id: "missions", label: "Missions", description: "Missions actives et terminées" },
  { id: "job_offers", label: "Offres d'emploi", description: "Annonces de recrutement" },
  { id: "candidates", label: "Candidats", description: "Candidatures reçues" },
  { id: "invoices", label: "Factures", description: "Factures clients" },
  { id: "invoice_lines", label: "Lignes de facture", description: "Détails des factures" },
  { id: "payrolls", label: "Paies", description: "Bulletins de paie" },
  { id: "trainings", label: "Formations", description: "Sessions de formation" },
  { id: "training_participants", label: "Participants formations", description: "Inscriptions aux formations" },
];

type ExportFormat = "json" | "csv";

export function DataExport() {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [format, setFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);

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
        // @ts-ignore - dynamic table access
        const { data, error } = await supabase.from(tableId).select("*");

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
      } else {
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
            className="flex gap-4"
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
          </RadioGroup>
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
