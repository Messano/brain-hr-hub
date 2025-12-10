import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const personnelSchema = z.object({
  // Informations générales
  nom: z.string().min(1, "Le nom est requis").max(100),
  prenom: z.string().min(1, "Le prénom est requis").max(100),
  nom_jeune_fille: z.string().max(100).optional().nullable(),
  civilite: z.enum(["Mr", "Mle", "Mme"]),
  adresse: z.string().max(500).optional().nullable(),
  complement_adresse: z.string().max(500).optional().nullable(),
  code_postal: z.string().max(10).optional().nullable(),
  ville: z.string().max(100).optional().nullable(),
  telephone1: z.string().max(20).optional().nullable(),
  telephone2: z.string().max(20).optional().nullable(),
  date_naissance: z.string().optional().nullable(),
  nationalite: z.string().max(50).optional().nullable(),
  situation_familiale: z.enum(["C", "M", "D"]).optional().nullable(),
  
  // Informations administratives
  type_document: z.string().max(50).optional().nullable(),
  numero_document: z.string().max(50).optional().nullable(),
  date_validite_document: z.string().optional().nullable(),
  qualification: z.string().max(255).optional().nullable(),
  date_entree: z.string().optional().nullable(),
  date_fin_mission: z.string().optional().nullable(),
  date_premiere_paie: z.string().optional().nullable(),
  
  // Informations de paiement
  mode_paiement: z.enum(["espece", "cheque", "virement"]).optional().nullable(),
  rib: z.string().max(24).optional().nullable(),
  domiciliation_bancaire: z.string().max(255).optional().nullable(),
  
  is_active: z.boolean().optional(),
});

type PersonnelFormData = z.infer<typeof personnelSchema>;

interface PersonnelFormProps {
  defaultValues?: Partial<PersonnelFormData>;
  onSubmit: (data: PersonnelFormData) => void;
  isLoading?: boolean;
}

const PersonnelForm = ({ defaultValues, onSubmit, isLoading }: PersonnelFormProps) => {
  const form = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      civilite: "Mr",
      situation_familiale: "C",
      type_document: "CIN",
      mode_paiement: "virement",
      is_active: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="admin">Informations administratives</TabsTrigger>
            <TabsTrigger value="payment">Paiement</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="civilite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Civilité *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mle">Mle</SelectItem>
                        <SelectItem value="Mme">Mme</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom de famille" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Prénom" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nom_jeune_fille"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de jeune fille</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Si applicable" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} placeholder="Adresse complète" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="complement_adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complément d'adresse</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Bâtiment, étage, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code_postal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code postal</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Code postal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ville"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Ville" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telephone1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone 1</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Numéro principal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telephone2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone 2</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Numéro secondaire" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date_naissance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationalite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationalité</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Nationalité" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="situation_familiale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situation familiale</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="C">Célibataire</SelectItem>
                        <SelectItem value="M">Marié(e)</SelectItem>
                        <SelectItem value="D">Divorcé(e)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type_document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de document</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="CIN, Passeport, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numero_document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro du document</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Numéro" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_validite_document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de validité</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Qualification professionnelle" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date_entree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'entrée</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_fin_mission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin de mission</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_premiere_paie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de 1ère paie</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="mode_paiement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode de paiement</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="espece">Espèce</SelectItem>
                      <SelectItem value="cheque">Chèque</SelectItem>
                      <SelectItem value="virement">Virement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rib"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RIB (24 chiffres)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || ""} 
                      placeholder="XXXX XXXX XXXX XXXX XXXX XXXX"
                      maxLength={24}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domiciliation_bancaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domiciliation bancaire</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Nom de la banque et agence" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PersonnelForm;
