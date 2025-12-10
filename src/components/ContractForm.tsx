import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "@/integrations/supabase/types";

type ContractType = Database["public"]["Enums"]["contract_type"];
type TrialPeriod = Database["public"]["Enums"]["trial_period"];
type ContractStatus = Database["public"]["Enums"]["contract_status"];

const contractSchema = z.object({
  type_contrat: z.enum(["nouveau", "modification", "renouvellement", "avenant", "duplicata"]),
  date_debut: z.string().min(1, "Date de début requise"),
  date_fin: z.string().optional(),
  date_entree_fonction: z.string().optional(),
  periode_essai: z.enum(["2_jours", "3_jours", "5_jours"]).optional(),
  motif_recours: z.string().optional(),
  justificatif: z.string().optional(),
  caracteristiques_poste: z.string().optional(),
  lieu_travail: z.string().optional(),
  numero_commande: z.string().optional(),
  salaire_reference: z.number().optional(),
  taux_horaire: z.number().optional(),
  coefficient_facturation: z.number().optional(),
  indemnites_non_soumises_rubrique: z.string().optional(),
  indemnites_non_soumises_montant: z.number().optional(),
  client_id: z.string().optional(),
  personnel_id: z.string().optional(),
  mission_id: z.string().optional(),
  status: z.enum(["brouillon", "actif", "termine", "annule"]).optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormProps {
  initialData?: Partial<ContractFormData>;
  onSubmit: (data: ContractFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ContractForm({ initialData, onSubmit, onCancel, isLoading }: ContractFormProps) {
  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      type_contrat: "nouveau",
      date_debut: "",
      date_fin: "",
      date_entree_fonction: "",
      periode_essai: "3_jours",
      motif_recours: "",
      justificatif: "",
      caracteristiques_poste: "",
      lieu_travail: "",
      numero_commande: "",
      salaire_reference: undefined,
      taux_horaire: undefined,
      coefficient_facturation: 1.00,
      indemnites_non_soumises_rubrique: "",
      indemnites_non_soumises_montant: 0,
      client_id: "",
      personnel_id: "",
      mission_id: "",
      status: "brouillon",
      ...initialData,
    },
  });

  const { data: missions } = useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select("id, title, status")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, raison_sociale, code")
        .eq("is_active", true)
        .order("raison_sociale");
      if (error) throw error;
      return data;
    },
  });

  const { data: personnel } = useQuery({
    queryKey: ["personnel"],
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

  const contractTypes: { value: ContractType; label: string }[] = [
    { value: "nouveau", label: "Nouveau" },
    { value: "modification", label: "Modification" },
    { value: "renouvellement", label: "Renouvellement" },
    { value: "avenant", label: "Avenant" },
    { value: "duplicata", label: "Duplicata" },
  ];

  const trialPeriods: { value: TrialPeriod; label: string }[] = [
    { value: "2_jours", label: "2 jours" },
    { value: "3_jours", label: "3 jours" },
    { value: "5_jours", label: "5 jours" },
  ];

  const statuses: { value: ContractStatus; label: string }[] = [
    { value: "brouillon", label: "Brouillon" },
    { value: "actif", label: "Actif" },
    { value: "termine", label: "Terminé" },
    { value: "annule", label: "Annulé" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="base" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="base">Informations de base</TabsTrigger>
            <TabsTrigger value="financial">Informations financières</TabsTrigger>
            <TabsTrigger value="relations">Relations</TabsTrigger>
          </TabsList>

          <TabsContent value="base" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type_contrat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de contrat *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contractTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_debut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_entree_fonction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'entrée en fonction</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periode_essai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Période d'essai</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la période" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {trialPeriods.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lieu_travail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de travail</FormLabel>
                    <FormControl>
                      <Input placeholder="Lieu de travail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_commande"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de commande</FormLabel>
                    <FormControl>
                      <Input placeholder="N° de commande" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="motif_recours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif de recours</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Remplacement, Accroissement d'activité, etc." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justificatif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justificatif</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Commandes clients, chantiers, etc." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caracteristiques_poste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caractéristiques du poste</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="EPI, risques, etc." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="financial" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salaire_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salaire de référence (S.ref)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taux_horaire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taux horaire (T.H)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coefficient_facturation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coefficient de facturation (T.F)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="1.00" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Indemnités non soumises</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="indemnites_non_soumises_rubrique"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de rubrique</FormLabel>
                      <FormControl>
                        <Input placeholder="N° rubrique" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="indemnites_non_soumises_montant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="relations" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.code} - {client.raison_sociale}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personnel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personnel / Intérimaire</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un personnel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {personnel?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.matricule} - {p.nom} {p.prenom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mission_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission associée</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une mission" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {missions?.map((mission) => (
                          <SelectItem key={mission.id} value={mission.id}>
                            {mission.title} ({mission.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
