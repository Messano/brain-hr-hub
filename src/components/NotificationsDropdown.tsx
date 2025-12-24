import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, FileText, Users, Briefcase, Calendar, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, parseISO, isBefore, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  time: Date;
  icon: React.ReactNode;
  link?: string;
}

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = new Date();
  const in7Days = addDays(today, 7);
  const in30Days = addDays(today, 30);

  // Fetch read notifications from database
  const { data: readNotificationsData } = useQuery({
    queryKey: ['read-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('read_notifications')
        .select('notification_key')
        .eq('user_id', user.id);
      if (error) throw error;
      return data?.map(n => n.notification_key) || [];
    },
    enabled: !!user?.id
  });

  const readNotifications = new Set(readNotificationsData || []);

  // Mutation to mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationKey: string) => {
      if (!user?.id) return;
      const { error } = await supabase
        .from('read_notifications')
        .upsert({ 
          user_id: user.id, 
          notification_key: notificationKey 
        }, { 
          onConflict: 'user_id,notification_key' 
        });
      if (error) throw error;
    },
    onMutate: async (notificationKey: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['read-notifications', user?.id] });
      
      // Snapshot the previous value
      const previousReadNotifications = queryClient.getQueryData<string[]>(['read-notifications', user?.id]);
      
      // Optimistically update to the new value
      queryClient.setQueryData<string[]>(['read-notifications', user?.id], (old) => {
        return [...(old || []), notificationKey];
      });
      
      return { previousReadNotifications };
    },
    onError: (err, notificationKey, context) => {
      // Rollback on error
      queryClient.setQueryData(['read-notifications', user?.id], context?.previousReadNotifications);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['read-notifications', user?.id] });
    }
  });

  // Mutation to mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async (notificationKeys: string[]) => {
      if (!user?.id || notificationKeys.length === 0) return;
      const { error } = await supabase
        .from('read_notifications')
        .upsert(
          notificationKeys.map(key => ({ 
            user_id: user.id, 
            notification_key: key 
          })),
          { onConflict: 'user_id,notification_key' }
        );
      if (error) throw error;
    },
    onMutate: async (notificationKeys: string[]) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['read-notifications', user?.id] });
      
      // Snapshot the previous value
      const previousReadNotifications = queryClient.getQueryData<string[]>(['read-notifications', user?.id]);
      
      // Optimistically update to the new value
      queryClient.setQueryData<string[]>(['read-notifications', user?.id], (old) => {
        const existingKeys = new Set(old || []);
        notificationKeys.forEach(key => existingKeys.add(key));
        return Array.from(existingKeys);
      });
      
      return { previousReadNotifications };
    },
    onError: (err, notificationKeys, context) => {
      // Rollback on error
      queryClient.setQueryData(['read-notifications', user?.id], context?.previousReadNotifications);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['read-notifications', user?.id] });
    }
  });

  // Fetch recent candidates
  const { data: recentCandidates } = useQuery({
    queryKey: ['notifications-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, full_name, applied_at, status')
        .eq('status', 'new')
        .order('applied_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch expiring contracts
  const { data: expiringContracts } = useQuery({
    queryKey: ['notifications-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('id, numero_contrat, date_fin')
        .eq('status', 'actif')
        .not('date_fin', 'is', null)
        .order('date_fin', { ascending: true })
        .limit(5);
      if (error) throw error;
      
      return data?.filter(c => {
        const endDate = parseISO(c.date_fin!);
        return isBefore(endDate, in30Days);
      }) || [];
    }
  });

  // Fetch pending missions
  const { data: pendingMissions } = useQuery({
    queryKey: ['notifications-missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('id, title, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch upcoming trainings
  const { data: upcomingTrainings } = useQuery({
    queryKey: ['notifications-trainings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select('id, title, start_date')
        .eq('status', 'planned')
        .order('start_date', { ascending: true })
        .limit(3);
      if (error) throw error;
      
      return data?.filter(t => {
        const startDate = parseISO(t.start_date);
        return isBefore(startDate, in7Days) && !isBefore(startDate, today);
      }) || [];
    }
  });

  // Fetch overdue invoices
  const { data: overdueInvoices } = useQuery({
    queryKey: ['notifications-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, due_date')
        .in('status', ['pending', 'sent'])
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(3);
      if (error) throw error;
      
      return data?.filter(inv => {
        const dueDate = parseISO(inv.due_date!);
        return isBefore(dueDate, today);
      }) || [];
    }
  });

  // Build notifications list
  const notifications: Notification[] = [];

  // Add candidate notifications
  recentCandidates?.forEach(candidate => {
    notifications.push({
      id: `candidate-${candidate.id}`,
      type: "info",
      title: "Nouvelle candidature",
      message: `${candidate.full_name} a postulé`,
      time: candidate.applied_at ? new Date(candidate.applied_at) : new Date(),
      icon: <Users className="h-4 w-4 text-primary" />,
      link: "/admin/candidates"
    });
  });

  // Add contract expiration notifications
  expiringContracts?.forEach(contract => {
    const endDate = parseISO(contract.date_fin!);
    const isCritical = isBefore(endDate, in7Days);
    notifications.push({
      id: `contract-${contract.id}`,
      type: isCritical ? "critical" : "warning",
      title: isCritical ? "Contrat expire bientôt!" : "Contrat à renouveler",
      message: `${contract.numero_contrat} expire le ${new Date(contract.date_fin!).toLocaleDateString('fr-FR')}`,
      time: new Date(contract.date_fin!),
      icon: <FileText className={`h-4 w-4 ${isCritical ? 'text-destructive' : 'text-warning'}`} />,
      link: `/admin/contracts/${contract.id}`
    });
  });

  // Add mission notifications
  pendingMissions?.forEach(mission => {
    notifications.push({
      id: `mission-${mission.id}`,
      type: "warning",
      title: "Mission en attente",
      message: `"${mission.title}" attend confirmation`,
      time: mission.created_at ? new Date(mission.created_at) : new Date(),
      icon: <Briefcase className="h-4 w-4 text-warning" />,
      link: `/admin/missions/${mission.id}`
    });
  });

  // Add training notifications
  upcomingTrainings?.forEach(training => {
    notifications.push({
      id: `training-${training.id}`,
      type: "info",
      title: "Formation à venir",
      message: `"${training.title}" débute le ${new Date(training.start_date).toLocaleDateString('fr-FR')}`,
      time: new Date(training.start_date),
      icon: <Calendar className="h-4 w-4 text-primary" />,
      link: "/admin/training"
    });
  });

  // Add overdue invoice notifications
  overdueInvoices?.forEach(invoice => {
    notifications.push({
      id: `invoice-${invoice.id}`,
      type: "critical",
      title: "Facture en retard!",
      message: `${invoice.invoice_number} était due le ${new Date(invoice.due_date!).toLocaleDateString('fr-FR')}`,
      time: new Date(invoice.due_date!),
      icon: <CreditCard className="h-4 w-4 text-destructive" />,
      link: `/admin/invoices/${invoice.id}`
    });
  });

  // Sort notifications by time (most recent first)
  notifications.sort((a, b) => b.time.getTime() - a.time.getTime());

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!readNotifications.has(notification.id)) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAllAsRead = () => {
    const unreadKeys = notifications
      .filter(n => !readNotifications.has(n.id))
      .map(n => n.id);
    if (unreadKeys.length > 0) {
      markAllAsReadMutation.mutate(unreadKeys);
    }
  };

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "critical":
        return "bg-destructive/10 border-l-destructive";
      case "warning":
        return "bg-warning/10 border-l-warning";
      case "success":
        return "bg-success/10 border-l-success";
      default:
        return "bg-primary/5 border-l-primary";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
              <Check className="h-3 w-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.slice(0, 10).map((notification) => {
              const isRead = readNotifications.has(notification.id);
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer border-l-2 ${getTypeStyles(notification.type)} ${isRead ? 'opacity-60' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5">{notification.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isRead ? 'font-normal' : 'font-medium'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notification.time, { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  {!isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </ScrollArea>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/admin')}
              >
                Voir toutes les tâches urgentes
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
