-- Create table to store custom role permissions
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  module text NOT NULL,
  can_view boolean DEFAULT false,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (role, module)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Only super_admin can manage permissions
CREATE POLICY "Super admin can manage permissions" ON public.role_permissions
FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Admin can view permissions
CREATE POLICY "Admin can view permissions" ON public.role_permissions
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default permissions for each role
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES
-- Super Admin - full access
('super_admin', 'dashboard', true, true, true, true),
('super_admin', 'personnel', true, true, true, true),
('super_admin', 'clients', true, true, true, true),
('super_admin', 'contracts', true, true, true, true),
('super_admin', 'missions', true, true, true, true),
('super_admin', 'invoices', true, true, true, true),
('super_admin', 'payroll', true, true, true, true),
('super_admin', 'recruitment', true, true, true, true),
('super_admin', 'candidates', true, true, true, true),
('super_admin', 'trainings', true, true, true, true),
('super_admin', 'planning', true, true, true, true),
('super_admin', 'reports', true, true, true, true),
('super_admin', 'users', true, true, true, true),
('super_admin', 'settings', true, true, true, true),
-- Admin - almost full access
('admin', 'dashboard', true, true, true, true),
('admin', 'personnel', true, true, true, true),
('admin', 'clients', true, true, true, true),
('admin', 'contracts', true, true, true, true),
('admin', 'missions', true, true, true, true),
('admin', 'invoices', true, true, true, true),
('admin', 'payroll', true, true, true, true),
('admin', 'recruitment', true, true, true, true),
('admin', 'candidates', true, true, true, true),
('admin', 'trainings', true, true, true, true),
('admin', 'planning', true, true, true, true),
('admin', 'reports', true, true, true, true),
('admin', 'users', true, true, true, false),
('admin', 'settings', true, true, true, false),
-- Manager - operational access
('manager', 'dashboard', true, true, true, false),
('manager', 'personnel', true, true, true, false),
('manager', 'clients', true, true, true, false),
('manager', 'contracts', true, true, true, false),
('manager', 'missions', true, true, true, false),
('manager', 'invoices', true, false, false, false),
('manager', 'payroll', true, false, false, false),
('manager', 'recruitment', true, true, true, false),
('manager', 'candidates', true, true, true, false),
('manager', 'trainings', true, true, true, false),
('manager', 'planning', true, true, true, false),
('manager', 'reports', true, true, false, false),
('manager', 'users', false, false, false, false),
('manager', 'settings', false, false, false, false),
-- RH - HR focused access
('rh', 'dashboard', true, false, false, false),
('rh', 'personnel', true, true, true, false),
('rh', 'clients', true, false, false, false),
('rh', 'contracts', true, true, true, false),
('rh', 'missions', true, true, true, false),
('rh', 'invoices', false, false, false, false),
('rh', 'payroll', true, true, true, false),
('rh', 'recruitment', true, true, true, false),
('rh', 'candidates', true, true, true, false),
('rh', 'trainings', true, true, true, false),
('rh', 'planning', true, true, true, false),
('rh', 'reports', true, false, false, false),
('rh', 'users', false, false, false, false),
('rh', 'settings', false, false, false, false),
-- User - limited access
('user', 'dashboard', true, false, false, false),
('user', 'personnel', true, false, false, false),
('user', 'clients', true, false, false, false),
('user', 'contracts', true, false, false, false),
('user', 'missions', true, false, false, false),
('user', 'invoices', false, false, false, false),
('user', 'payroll', false, false, false, false),
('user', 'recruitment', false, false, false, false),
('user', 'candidates', false, false, false, false),
('user', 'trainings', true, false, false, false),
('user', 'planning', true, false, false, false),
('user', 'reports', false, false, false, false),
('user', 'users', false, false, false, false),
('user', 'settings', false, false, false, false);