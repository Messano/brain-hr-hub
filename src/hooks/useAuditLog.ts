import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Json } from '@/integrations/supabase/types';

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'login' 
  | 'logout' 
  | 'export'
  | 'import'
  | 'status_change'
  | 'role_change';

export type EntityType = 
  | 'client'
  | 'personnel'
  | 'contract'
  | 'invoice'
  | 'mission'
  | 'candidate'
  | 'job_offer'
  | 'training'
  | 'payroll'
  | 'user'
  | 'event'
  | 'report'
  | 'permission';

interface LogActionParams {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}

export function useAuditLog() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const logAction = useMutation({
    mutationFn: async ({ action, entityType, entityId, oldData, newData }: LogActionParams) => {
      if (!user) {
        console.warn('Cannot log action: user not authenticated');
        return null;
      }

      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: user.id,
          user_email: user.email,
          user_name: profile?.full_name || null,
          action,
          entity_type: entityType,
          entity_id: entityId || null,
          old_data: (oldData as Json) || null,
          new_data: (newData as Json) || null,
          user_agent: navigator.userAgent,
        }]);

      if (error) {
        console.error('Failed to log audit action:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });

  return {
    logAction: logAction.mutate,
    logActionAsync: logAction.mutateAsync,
    isLogging: logAction.isPending,
  };
}

interface UseAuditLogsParams {
  entityType?: EntityType;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export function useAuditLogs(params: UseAuditLogsParams = {}) {
  const { entityType, action, userId, startDate, endDate, limit = 100 } = params;

  return useQuery({
    queryKey: ['audit_logs', entityType, action, userId, startDate?.toISOString(), endDate?.toISOString(), limit],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      if (action) {
        query = query.eq('action', action);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}

// Helper to get action label in French
export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    create: 'Création',
    update: 'Modification',
    delete: 'Suppression',
    view: 'Consultation',
    login: 'Connexion',
    logout: 'Déconnexion',
    export: 'Export',
    import: 'Import',
    status_change: 'Changement de statut',
    role_change: 'Changement de rôle',
  };
  return labels[action] || action;
}

// Helper to get entity type label in French
export function getEntityTypeLabel(entityType: string): string {
  const labels: Record<string, string> = {
    client: 'Client',
    personnel: 'Personnel',
    contract: 'Contrat',
    invoice: 'Facture',
    mission: 'Mission',
    candidate: 'Candidat',
    job_offer: 'Offre d\'emploi',
    training: 'Formation',
    payroll: 'Paie',
    user: 'Utilisateur',
    event: 'Événement',
    report: 'Rapport',
    permission: 'Permission',
  };
  return labels[entityType] || entityType;
}
