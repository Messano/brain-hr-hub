
-- Remove foreign key constraint on user_roles to allow test data
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Insert test user roles
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'admin'),
  ('33333333-3333-3333-3333-333333333333', 'manager'),
  ('44444444-4444-4444-4444-444444444444', 'manager'),
  ('55555555-5555-5555-5555-555555555555', 'user'),
  ('66666666-6666-6666-6666-666666666666', 'user');
