import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";

type MissionStatus = Database["public"]["Enums"]["mission_status"];

const missionSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200, "Le titre est trop long"),
  description: z.string().max(2000, "Description trop longue").optional(),
  client_id: z.string().optional(),
  candidate_id: z.string().optional(),
  personnel_id: z.string().optional(),
  location: z.string().max(200, "Localisation trop longue").optional(),
  mission_type: z.string().max(100, "Type trop long").optional(),
  daily_rate: z.coerce.number().min(0, "Le tarif doit être positif").optional(),
  start_date: z.date({ required_error: "La date de début est requise" }),
  end_date: z.date().optional(),
  status: z.enum(["active", "pending", "completed", "cancelled"]).default("pending"),
});

type MissionFormValues = z.infer<typeof missionSchema>;

interface MissionFormProps {
  mission?: {
    id: string;
    title: string;
    description: string | null;
    client_id: string | null;
    candidate_id: string | null;
    personnel_id?: string | null;
    location: string | null;
    mission_type: string | null;
    daily_rate: number | null;
    start_date: string;
    end_date: string | null;
    status: MissionStatus | null;
  };
  onSubmit: (data: MissionFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function MissionForm({ mission, onSubmit, onCancel, isSubmitting }: MissionFormProps) {
  const form = useForm<MissionFormValues>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      title: mission?.title || "",
      description: mission?.description || "",
      client_id: mission?.client_id || undefined,
      candidate_id: mission?.candidate_id || undefined,
      personnel_id: mission?.personnel_id || undefined,
      location: mission?.location || "",
      mission_type: mission?.mission_type || "",
      daily_rate: mission?.daily_rate || undefined,
      start_date: mission?.start_date ? new Date(mission.start_date) : undefined,
      end_date: mission?.end_date ? new Date(mission.end_date) : undefined,
      status: (mission?.status as MissionStatus) || "pending",
    },
  });

  // Fetch clients
  const { data: clients } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, raison_sociale")
        .eq("is_active", true)
        .order("raison_sociale");
      if (error) throw error;
      return data;
    },
  });

  // Fetch candidates
  const { data: candidates } = useQuery({
    queryKey: ["candidates-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("id, full_name, email")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch personnel
  const { data: personnel } = useQuery({
    queryKey: ["personnel-list"],
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

  const handleSubmit = async (data: MissionFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Titre de la mission *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Développeur React Senior" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                        {client.raison_sociale}
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
            name="candidate_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Candidat</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un candidat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {candidates?.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.full_name} ({candidate.email})
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
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localisation</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Paris, Remote" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mission_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de mission</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Intérim">Intérim</SelectItem>
                    <SelectItem value="Mission">Mission</SelectItem>
                    <SelectItem value="Projet">Projet</SelectItem>
                    <SelectItem value="Formation">Formation</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="daily_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarif journalier (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 450"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
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
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description de la mission..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mission ? "Mettre à jour" : "Créer la mission"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
