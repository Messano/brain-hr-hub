import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Event, EventInsert, useCreateEvent, useUpdateEvent } from "@/hooks/useEvents";
import { format } from "date-fns";

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  defaultDate?: Date;
}

const eventTypes = [
  { value: "meeting", label: "Réunion" },
  { value: "interview", label: "Entretien" },
  { value: "training", label: "Formation" },
  { value: "deadline", label: "Échéance" },
  { value: "other", label: "Autre" },
];

export function EventForm({ open, onOpenChange, event, defaultDate }: EventFormProps) {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    event_type: "meeting" | "interview" | "training" | "deadline" | "other";
    start_datetime: string;
    end_datetime: string;
    location: string;
    attendees: string[];
  }>({
    title: "",
    description: "",
    event_type: "meeting",
    start_datetime: "",
    end_datetime: "",
    location: "",
    attendees: [],
  });
  const [attendeesInput, setAttendeesInput] = useState("");

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        event_type: (event.event_type || "meeting") as "meeting" | "interview" | "training" | "deadline" | "other",
        start_datetime: event.start_datetime ? format(new Date(event.start_datetime), "yyyy-MM-dd'T'HH:mm") : "",
        end_datetime: event.end_datetime ? format(new Date(event.end_datetime), "yyyy-MM-dd'T'HH:mm") : "",
        location: event.location || "",
        attendees: event.attendees || [],
      });
      setAttendeesInput(event.attendees?.join(", ") || "");
    } else if (defaultDate) {
      const startDate = new Date(defaultDate);
      startDate.setHours(9, 0, 0, 0);
      const endDate = new Date(defaultDate);
      endDate.setHours(10, 0, 0, 0);
      
      setFormData({
        title: "",
        description: "",
        event_type: "meeting",
        start_datetime: format(startDate, "yyyy-MM-dd'T'HH:mm"),
        end_datetime: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        location: "",
        attendees: [],
      });
      setAttendeesInput("");
    } else {
      setFormData({
        title: "",
        description: "",
        event_type: "meeting",
        start_datetime: "",
        end_datetime: "",
        location: "",
        attendees: [],
      });
      setAttendeesInput("");
    }
  }, [event, defaultDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const attendeesArray = attendeesInput
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const eventData: EventInsert = {
      title: formData.title,
      description: formData.description || null,
      event_type: formData.event_type,
      start_datetime: formData.start_datetime,
      end_datetime: formData.end_datetime || null,
      location: formData.location || null,
      attendees: attendeesArray.length > 0 ? attendeesArray : null,
    };

    if (event) {
      await updateEvent.mutateAsync({ id: event.id, ...eventData });
    } else {
      await createEvent.mutateAsync(eventData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {event ? "Modifier l'événement" : "Nouvel événement"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_type">Type d'événement</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value: any) => setFormData({ ...formData, event_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_datetime">Début *</Label>
              <Input
                id="start_datetime"
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_datetime">Fin</Label>
              <Input
                id="end_datetime"
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">Participants (séparés par des virgules)</Label>
            <Input
              id="attendees"
              value={attendeesInput}
              onChange={(e) => setAttendeesInput(e.target.value)}
              placeholder="Jean Dupont, Marie Martin..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
              {event ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
