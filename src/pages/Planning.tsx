import { Plus, Calendar, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Planning() {
  const events = [
    {
      title: "Entretien - Marie Dupont",
      type: "interview",
      date: "2024-02-15",
      time: "09:00",
      duration: "1h",
      location: "Salle de réunion A",
      attendees: ["RH Manager", "Chef d'équipe Dev"]
    },
    {
      title: "Formation Sécurité",
      type: "training",
      date: "2024-02-15", 
      time: "14:00",
      duration: "2h",
      location: "Salle de formation",
      attendees: ["45 employés"]
    },
    {
      title: "Mission - Audit SecureBank",
      type: "mission",
      date: "2024-02-16",
      time: "09:00",
      duration: "Toute la journée",
      location: "Client - Lyon",
      attendees: ["Jean Martin"]
    }
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'interview':
        return <Badge className="bg-primary text-primary-foreground">Entretien</Badge>;
      case 'training':
        return <Badge className="bg-warning text-warning-foreground">Formation</Badge>;
      case 'mission':
        return <Badge className="bg-success text-success-foreground">Mission</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planning</h1>
          <p className="text-muted-foreground">Agenda collaboratif et planification des activités</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nouvel événement</span>
        </Button>
      </div>

      {/* Calendar View Toggle */}
      <div className="flex space-x-2">
        <Button variant="outline">Aujourd'hui</Button>
        <Button variant="outline">Semaine</Button>
        <Button>Mois</Button>
        <Button variant="outline">Liste</Button>
      </div>

      {/* Today's Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Événements d'aujourd'hui</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium">{event.title}</h3>
                    {getTypeBadge(event.type)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {event.time} ({event.duration})
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {event.location}
                    </span>
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {event.attendees.join(", ")}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                  <Button size="sm">
                    Rejoindre
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary">12</h3>
              <p className="text-muted-foreground">Événements cette semaine</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-warning">5</h3>
              <p className="text-muted-foreground">Formations planifiées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-success">8</h3>
              <p className="text-muted-foreground">Missions actives</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}