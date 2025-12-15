import { Calendar, Clock, MapPin, User, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Event, useDeleteEvent } from "@/hooks/useEvents";
import { format, isToday, isTomorrow, isPast, isFuture, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

interface PlanningListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  filter?: "today" | "upcoming" | "past" | "all";
}

const eventTypeLabels: Record<string, string> = {
  meeting: "Réunion",
  interview: "Entretien",
  training: "Formation",
  deadline: "Échéance",
  other: "Autre",
};

const eventTypeBadgeColors: Record<string, string> = {
  meeting: "bg-primary text-primary-foreground",
  interview: "bg-blue-500 text-white",
  training: "bg-amber-500 text-white",
  deadline: "bg-destructive text-destructive-foreground",
  other: "bg-muted text-muted-foreground",
};

export function PlanningList({ events, onEventClick, filter = "all" }: PlanningListProps) {
  const deleteEvent = useDeleteEvent();

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.start_datetime);
    const today = startOfDay(new Date());

    switch (filter) {
      case "today":
        return isToday(eventDate);
      case "upcoming":
        return isFuture(eventDate) || isToday(eventDate);
      case "past":
        return isPast(eventDate) && !isToday(eventDate);
      default:
        return true;
    }
  });

  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = format(new Date(event.start_datetime), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, Event[]>);

  const sortedDates = Object.keys(groupedEvents).sort();

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  };

  if (filteredEvents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun événement à afficher</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {formatDateHeader(date)}
          </h3>
          <div className="space-y-2">
            {groupedEvents[date].map((event) => (
              <Card
                key={event.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge className={eventTypeBadgeColors[event.event_type || "other"]}>
                          {eventTypeLabels[event.event_type || "other"]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(event.start_datetime), "HH:mm")}
                          {event.end_datetime && (
                            <> - {format(new Date(event.end_datetime), "HH:mm")}</>
                          )}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                          </span>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {event.attendees.join(", ")}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'événement ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. L'événement "{event.title}" sera
                              définitivement supprimé.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEvent.mutate(event.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
