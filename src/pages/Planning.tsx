import { useState } from "react";
import { Plus, Calendar, List, Clock, CalendarDays, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/KPICard";
import { PlanningCalendar } from "@/components/PlanningCalendar";
import { PlanningList } from "@/components/PlanningList";
import { EventForm } from "@/components/EventForm";
import { useEvents, Event } from "@/hooks/useEvents";
import { isToday, isFuture, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export default function Planning() {
  const { data: events = [], isLoading } = useEvents();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [listFilter, setListFilter] = useState<"today" | "upcoming" | "past" | "all">("upcoming");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleDayClick = (date: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date);
    setFormOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setFormOpen(true);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setSelectedDate(new Date());
    setFormOpen(true);
  };

  // Calculate KPIs
  const todayEvents = events.filter((e) => isToday(new Date(e.start_datetime)));
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEvents = events.filter((e) =>
    isWithinInterval(new Date(e.start_datetime), { start: weekStart, end: weekEnd })
  );
  const upcomingEvents = events.filter(
    (e) => isFuture(new Date(e.start_datetime)) || isToday(new Date(e.start_datetime))
  );
  const trainings = events.filter((e) => e.event_type === "training");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Planning</h1>
          <p className="text-muted-foreground">
            Agenda collaboratif et planification des activités
          </p>
        </div>
        <Button onClick={handleNewEvent} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvel événement
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Aujourd'hui"
          value={todayEvents.length}
          icon={<Calendar className="w-5 h-5" />}
          description="événement(s)"
        />
        <KPICard
          title="Cette semaine"
          value={weekEvents.length}
          icon={<CalendarRange className="w-5 h-5" />}
          description="événement(s)"
        />
        <KPICard
          title="À venir"
          value={upcomingEvents.length}
          icon={<CalendarDays className="w-5 h-5" />}
          description="événement(s) planifié(s)"
        />
        <KPICard
          title="Formations"
          value={trainings.length}
          icon={<Clock className="w-5 h-5" />}
          description="formation(s) planifiée(s)"
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={view === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("calendar")}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Calendrier
        </Button>
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("list")}
          className="flex items-center gap-2"
        >
          <List className="w-4 h-4" />
          Liste
        </Button>
      </div>

      {/* Content */}
      {view === "calendar" ? (
        <PlanningCalendar
          events={events}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
        />
      ) : (
        <div className="space-y-4">
          <Tabs value={listFilter} onValueChange={(v) => setListFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
              <TabsTrigger value="upcoming">À venir</TabsTrigger>
              <TabsTrigger value="past">Passés</TabsTrigger>
              <TabsTrigger value="all">Tous</TabsTrigger>
            </TabsList>
          </Tabs>
          <PlanningList
            events={events}
            onEventClick={handleEventClick}
            filter={listFilter}
          />
        </div>
      )}

      {/* Event Form Dialog */}
      <EventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        event={selectedEvent}
        defaultDate={selectedDate}
      />
    </div>
  );
}
