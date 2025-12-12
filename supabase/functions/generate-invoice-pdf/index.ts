import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId } = await req.json();
    console.log("Generating PDF for invoice:", invoiceId);

    if (!invoiceId) {
      throw new Error("Invoice ID is required");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch invoice with client details
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        clients (
          raison_sociale, code, adresse, adresse_facturation, 
          telephone, email, code_ice, tva, mode_reglement,
          delai_reglement, contact_nom
        )
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError) {
      console.error("Error fetching invoice:", invoiceError);
      throw new Error("Invoice not found");
    }

    console.log("Invoice fetched:", invoice.invoice_number);

    // Fetch invoice lines with personnel info
    const { data: lines, error: linesError } = await supabase
      .from("invoice_lines")
      .select(`
        *,
        personnel (nom, prenom, matricule),
        contracts (numero_contrat, taux_horaire)
      `)
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: true });

    if (linesError) {
      console.error("Error fetching lines:", linesError);
      throw new Error("Failed to fetch invoice lines");
    }

    console.log("Lines fetched:", lines?.length || 0);

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    const primaryColor = rgb(0.2, 0.4, 0.8);
    const textColor = rgb(0.1, 0.1, 0.1);
    const mutedColor = rgb(0.4, 0.4, 0.4);
    
    let y = height - 50;

    // Helper function to draw text
    const drawText = (text: string, x: number, yPos: number, options: { font?: any; size?: number; color?: any } = {}) => {
      page.drawText(text, {
        x,
        y: yPos,
        font: options.font || helvetica,
        size: options.size || 10,
        color: options.color || textColor,
      });
    };

    // Header - Company name
    drawText("BrainCRM", 50, y, { font: helveticaBold, size: 24, color: primaryColor });
    
    // Invoice number (right aligned)
    drawText(`FACTURE N° ${invoice.invoice_number}`, width - 200, y, { font: helveticaBold, size: 14 });
    
    y -= 40;

    // Invoice dates
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    };

    drawText(`Date d'émission: ${formatDate(invoice.issue_date)}`, width - 200, y, { size: 9, color: mutedColor });
    y -= 14;
    if (invoice.due_date) {
      drawText(`Date d'échéance: ${formatDate(invoice.due_date)}`, width - 200, y, { size: 9, color: mutedColor });
    }
    y -= 14;
    drawText(`Période: ${formatDate(invoice.period_start)} - ${formatDate(invoice.period_end)}`, width - 200, y, { size: 9, color: mutedColor });

    y -= 40;

    // Client info box
    page.drawRectangle({
      x: 50,
      y: y - 80,
      width: 250,
      height: 90,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    drawText("FACTURER À:", 60, y, { font: helveticaBold, size: 9, color: mutedColor });
    y -= 15;
    
    const client = invoice.clients;
    if (client) {
      drawText(client.raison_sociale || "", 60, y, { font: helveticaBold, size: 11 });
      y -= 14;
      if (client.adresse_facturation || client.adresse) {
        drawText(client.adresse_facturation || client.adresse, 60, y, { size: 9 });
        y -= 12;
      }
      if (client.telephone) {
        drawText(`Tél: ${client.telephone}`, 60, y, { size: 9 });
        y -= 12;
      }
      if (client.code_ice) {
        drawText(`ICE: ${client.code_ice}`, 60, y, { size: 9, color: mutedColor });
        y -= 12;
      }
    }

    y -= 50;

    // Table header
    const tableTop = y;
    const colWidths = [150, 60, 60, 60, 80, 85];
    const colX = [50, 200, 260, 320, 380, 460];

    // Header background
    page.drawRectangle({
      x: 50,
      y: tableTop - 5,
      width: width - 100,
      height: 20,
      color: rgb(0.95, 0.95, 0.95),
    });

    drawText("Intérimaire", colX[0], tableTop, { font: helveticaBold, size: 9 });
    drawText("H. Norm.", colX[1], tableTop, { font: helveticaBold, size: 9 });
    drawText("H. Sup 25%", colX[2], tableTop, { font: helveticaBold, size: 9 });
    drawText("H. Sup 50%", colX[3], tableTop, { font: helveticaBold, size: 9 });
    drawText("H. Sup 100%", colX[4], tableTop, { font: helveticaBold, size: 9 });
    drawText("Montant HT", colX[5], tableTop, { font: helveticaBold, size: 9 });

    y = tableTop - 25;

    // Table rows
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + " MAD";
    };

    if (lines && lines.length > 0) {
      for (const line of lines) {
        const personnelName = line.personnel 
          ? `${line.personnel.matricule} - ${line.personnel.nom} ${line.personnel.prenom}`
          : line.description || "-";
        
        // Truncate if too long
        const displayName = personnelName.length > 25 ? personnelName.substring(0, 22) + "..." : personnelName;
        
        drawText(displayName, colX[0], y, { size: 9 });
        drawText(String(line.heures_normales || 0), colX[1], y, { size: 9 });
        drawText(String(line.heures_sup_25 || 0), colX[2], y, { size: 9 });
        drawText(String(line.heures_sup_50 || 0), colX[3], y, { size: 9 });
        drawText(String(line.heures_sup_100 || 0), colX[4], y, { size: 9 });
        drawText(formatCurrency(Number(line.montant_ht) || 0), colX[5], y, { size: 9 });
        
        y -= 18;

        // Add page break if needed
        if (y < 150) {
          const newPage = pdfDoc.addPage([595, 842]);
          y = height - 50;
        }
      }
    } else {
      drawText("Aucune ligne de facturation", colX[0], y, { size: 9, color: mutedColor });
      y -= 18;
    }

    // Line separator
    y -= 10;
    page.drawLine({
      start: { x: 50, y: y },
      end: { x: width - 50, y: y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    y -= 30;

    // Totals section
    const totalsX = width - 200;
    
    drawText("Total HT:", totalsX, y, { size: 10 });
    drawText(formatCurrency(Number(invoice.total_ht)), totalsX + 80, y, { font: helveticaBold, size: 10 });
    y -= 18;

    const tvaLabel = client?.tva === "exoneree" ? "TVA (Exonérée)" : client?.tva === "reduite" ? "TVA (Réduite)" : "TVA (20%)";
    drawText(tvaLabel + ":", totalsX, y, { size: 10 });
    drawText(formatCurrency(Number(invoice.total_tva)), totalsX + 80, y, { font: helveticaBold, size: 10 });
    y -= 20;

    // Total TTC box
    page.drawRectangle({
      x: totalsX - 10,
      y: y - 5,
      width: 165,
      height: 25,
      color: primaryColor,
    });
    
    drawText("Total TTC:", totalsX, y, { font: helveticaBold, size: 11, color: rgb(1, 1, 1) });
    drawText(formatCurrency(Number(invoice.total_ttc)), totalsX + 80, y, { font: helveticaBold, size: 11, color: rgb(1, 1, 1) });

    y -= 50;

    // Payment info
    if (client?.mode_reglement || client?.delai_reglement) {
      drawText("Conditions de paiement:", 50, y, { font: helveticaBold, size: 9 });
      y -= 14;
      
      const modeReglement = client.mode_reglement === "cheque" ? "Chèque" : 
                           client.mode_reglement === "traite" ? "Traite" : "Virement";
      drawText(`Mode de règlement: ${modeReglement}`, 50, y, { size: 9 });
      y -= 12;
      
      if (client.delai_reglement) {
        drawText(`Délai de règlement: ${client.delai_reglement} jours`, 50, y, { size: 9 });
      }
    }

    // Notes
    if (invoice.notes) {
      y -= 30;
      drawText("Notes:", 50, y, { font: helveticaBold, size: 9 });
      y -= 14;
      drawText(invoice.notes, 50, y, { size: 9, color: mutedColor });
    }

    // Footer
    page.drawText("Généré par BrainCRM", 50, 30, { 
      font: helvetica, 
      size: 8, 
      color: mutedColor 
    });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));

    console.log("PDF generated successfully, size:", pdfBytes.length);

    return new Response(
      JSON.stringify({ 
        pdf: base64Pdf,
        filename: `${invoice.invoice_number}.pdf`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
