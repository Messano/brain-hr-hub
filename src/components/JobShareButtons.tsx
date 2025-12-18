import { useState } from "react";
import { Linkedin, Copy, Webhook, Check, ExternalLink, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JobShareButtonsProps {
  jobOffer: {
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    job_type?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    requirements?: string[] | null;
    responsibilities?: string[] | null;
    benefits?: string[] | null;
    department?: string | null;
  };
  publicUrl?: string;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  interim: "Intérim",
  freelance: "Freelance",
  stage: "Stage",
};

export default function JobShareButtons({ jobOffer, publicUrl }: JobShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [sendingWebhook, setSendingWebhook] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);

  // Generate the public job URL
  const jobUrl = publicUrl || `${window.location.origin}/emplois/${jobOffer.id}`;

  // Format job type label
  const jobTypeLabel = jobOffer.job_type ? JOB_TYPE_LABELS[jobOffer.job_type] || jobOffer.job_type : "";

  // Generate LinkedIn share URL
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;

  // Generate formatted text for copying
  const generateFormattedText = () => {
    let text = `🚀 Offre d'emploi : ${jobOffer.title}\n\n`;
    
    if (jobOffer.location) text += `📍 Lieu : ${jobOffer.location}\n`;
    if (jobTypeLabel) text += `📋 Contrat : ${jobTypeLabel}\n`;
    if (jobOffer.department) text += `🏢 Département : ${jobOffer.department}\n`;
    
    if (jobOffer.salary_min || jobOffer.salary_max) {
      const salaryRange = jobOffer.salary_min && jobOffer.salary_max 
        ? `${jobOffer.salary_min.toLocaleString()} - ${jobOffer.salary_max.toLocaleString()} €`
        : jobOffer.salary_min 
          ? `À partir de ${jobOffer.salary_min.toLocaleString()} €`
          : `Jusqu'à ${jobOffer.salary_max?.toLocaleString()} €`;
      text += `💰 Salaire : ${salaryRange}\n`;
    }

    if (jobOffer.description) {
      text += `\n📝 Description :\n${jobOffer.description}\n`;
    }

    if (jobOffer.requirements && jobOffer.requirements.length > 0) {
      text += `\n✅ Compétences requises :\n${jobOffer.requirements.map(r => `• ${r}`).join("\n")}\n`;
    }

    if (jobOffer.responsibilities && jobOffer.responsibilities.length > 0) {
      text += `\n🎯 Responsabilités :\n${jobOffer.responsibilities.map(r => `• ${r}`).join("\n")}\n`;
    }

    if (jobOffer.benefits && jobOffer.benefits.length > 0) {
      text += `\n🎁 Avantages :\n${jobOffer.benefits.map(b => `• ${b}`).join("\n")}\n`;
    }

    text += `\n🔗 Postuler : ${jobUrl}\n`;
    text += `\n#emploi #recrutement #${jobTypeLabel.toLowerCase().replace(/\s+/g, "")}`;

    return text;
  };

  // Copy formatted text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateFormattedText());
      setCopied(true);
      toast({
        title: "Texte copié !",
        description: "L'offre formatée a été copiée dans le presse-papiers. Collez-la sur Indeed, Monster, ou autre.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte.",
        variant: "destructive",
      });
    }
  };

  // Share on LinkedIn
  const handleLinkedInShare = () => {
    window.open(linkedInShareUrl, "_blank", "width=600,height=600");
    toast({
      title: "Partage LinkedIn",
      description: "Une nouvelle fenêtre s'est ouverte pour partager sur LinkedIn.",
    });
  };

  // Send to Zapier webhook
  const handleZapierWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "URL requise",
        description: "Veuillez entrer l'URL de votre webhook Zapier.",
        variant: "destructive",
      });
      return;
    }

    setSendingWebhook(true);

    try {
      const payload = {
        job_id: jobOffer.id,
        title: jobOffer.title,
        description: jobOffer.description,
        location: jobOffer.location,
        job_type: jobTypeLabel,
        department: jobOffer.department,
        salary_min: jobOffer.salary_min,
        salary_max: jobOffer.salary_max,
        requirements: jobOffer.requirements,
        responsibilities: jobOffer.responsibilities,
        benefits: jobOffer.benefits,
        apply_url: jobUrl,
        formatted_text: generateFormattedText(),
        timestamp: new Date().toISOString(),
        source: "BrainCRM",
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(payload),
      });

      toast({
        title: "Envoyé à Zapier !",
        description: "L'offre a été envoyée à votre webhook. Vérifiez l'historique de votre Zap pour confirmer.",
      });
      setWebhookDialogOpen(false);
    } catch (error) {
      console.error("Error sending webhook:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer à Zapier. Vérifiez l'URL du webhook.",
        variant: "destructive",
      });
    } finally {
      setSendingWebhook(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Partager l'offre
        </CardTitle>
        <CardDescription>
          Publiez cette offre sur les réseaux sociaux et job boards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Social Sharing Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleLinkedInShare}
            className="flex items-center gap-2 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 border-[#0077B5]/30 text-[#0077B5]"
          >
            <Linkedin className="w-4 h-4" />
            Partager sur LinkedIn
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCopyText}
            className="flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copié !" : "Copier pour Indeed / autres"}
          </Button>
        </div>

        <Separator />

        {/* Zapier Integration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Automatisation Zapier</p>
              <p className="text-xs text-muted-foreground">
                Connectez un webhook pour publier automatiquement sur plusieurs plateformes
              </p>
            </div>
            <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="secondary" size="sm" className="flex items-center gap-2">
                  <Webhook className="w-4 h-4" />
                  Configurer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Intégration Zapier</DialogTitle>
                  <DialogDescription>
                    Entrez l'URL de votre webhook Zapier pour envoyer automatiquement cette offre vers vos plateformes connectées (Indeed, Monster, Glassdoor, etc.)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL du Webhook Zapier</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Créez un Zap avec un déclencheur "Webhooks by Zapier" pour obtenir cette URL
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-2">
                    <p className="font-medium">Données envoyées :</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Titre, description, lieu</li>
                      <li>• Type de contrat, salaire</li>
                      <li>• Compétences, responsabilités, avantages</li>
                      <li>• Lien de candidature</li>
                      <li>• Texte formaté prêt à publier</li>
                    </ul>
                  </div>

                  <Button
                    type="button"
                    onClick={handleZapierWebhook}
                    disabled={sendingWebhook || !webhookUrl}
                    className="w-full"
                  >
                    {sendingWebhook ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer l'offre
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick copy URL */}
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <Input
            value={jobUrl}
            readOnly
            className="text-xs bg-transparent border-0 focus-visible:ring-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(jobUrl);
              toast({ title: "URL copiée !" });
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
