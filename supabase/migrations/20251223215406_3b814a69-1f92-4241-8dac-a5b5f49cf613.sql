-- Create audit_logs table to track user actions
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super_admin and admin can view audit logs
CREATE POLICY "Admin can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- All authenticated users can insert audit logs (for their own actions)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add audit_logs module to role_permissions
INSERT INTO role_permissions (role, module, can_view, can_create, can_edit, can_delete)
VALUES 
  ('super_admin', 'audit_logs', true, true, true, true),
  ('admin', 'audit_logs', true, false, false, false),
  ('manager', 'audit_logs', false, false, false, false),
  ('user', 'audit_logs', false, false, false, false),
  ('rh', 'audit_logs', false, false, false, false)
ON CONFLICT (role, module) DO NOTHING;