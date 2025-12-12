import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { TrainingInsert, TrainingUpdate } from "@/hooks/useTrainings";

const trainingSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  category: z.string().optional(),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().optional(),
  duration_hours: z.coerce.number().optional(),
  location: z.string().optional(),
  trainer: z.string().optional(),
  max_participants: z.coerce.number().optional(),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]).optional(),
});

type TrainingFormData = z.infer<typeof trainingSchema>;

interface TrainingFormProps {
  training?: TrainingUpdate & { id?: string };
  onSubmit: (data: TrainingInsert | TrainingUpdate) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TrainingForm({ training, onSubmit, onCancel, isLoading }: TrainingFormProps) {
  const form = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      title: training?.title || "",
      description: training?.description || "",
      category: training?.category || "",
      start_date: training?.start_date || "",
      end_date: training?.end_date || "",
      duration_hours: training?.duration_hours || undefined,
      location: training?.location || "",
      trainer: training?.trainer || "",
      max_participants: training?.max_participants || undefined,
      status: (training?.status as TrainingFormData["status"]) || "planned",
    },
  });

  const handleSubmit = (data: TrainingFormData) => {
    onSubmit({
      ...data,
      end_date: data.end_date || null,
      duration_hours: data.duration_hours || null,
      max_participants: data.max_participants || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Titre *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Titre de la formation" />
                </FormControl>
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
                  <Textarea {...field} placeholder="Description de la formation" rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Sécurité">Sécurité</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Technique">Technique</SelectItem>
                    <SelectItem value="Bureautique">Bureautique</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planned">Planifiée</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
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
            name="start_date"
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
            name="end_date"
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
            name="duration_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée (heures)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="8" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_participants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participants max</FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trainer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formateur</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nom du formateur" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Lieu de la formation" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {training?.id ? "Modifier" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
