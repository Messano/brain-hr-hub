
-- =============================================
-- Fix RLS Policies for All Tables
-- =============================================

-- 1. CANDIDATES TABLE
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow public delete on candidates" ON public.candidates;
DROP POLICY IF EXISTS "Allow public insert on candidates" ON public.candidates;
DROP POLICY IF EXISTS "Allow public read on candidates" ON public.candidates;
DROP POLICY IF EXISTS "Allow public update on candidates" ON public.candidates;

-- Create proper policies for candidates
-- Public can still apply to jobs (INSERT)
CREATE POLICY "Public can apply to jobs" ON public.candidates
FOR INSERT WITH CHECK (true);

-- Only admin/manager can view candidates
CREATE POLICY "Staff can view candidates" ON public.candidates
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Only admin/manager can update candidates
CREATE POLICY "Staff can update candidates" ON public.candidates
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Only admin can delete candidates
CREATE POLICY "Admin can delete candidates" ON public.candidates
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 2. CLIENTS TABLE
DROP POLICY IF EXISTS "Allow public delete on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public insert on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public read on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public update on clients" ON public.clients;

CREATE POLICY "Staff can view clients" ON public.clients
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can insert clients" ON public.clients
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can update clients" ON public.clients
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admin can delete clients" ON public.clients
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 3. JOB_OFFERS TABLE
DROP POLICY IF EXISTS "Allow public delete on job_offers" ON public.job_offers;
DROP POLICY IF EXISTS "Allow public insert on job_offers" ON public.job_offers;
DROP POLICY IF EXISTS "Allow public read on job_offers" ON public.job_offers;
DROP POLICY IF EXISTS "Allow public update on job_offers" ON public.job_offers;

-- Public can view active job offers (for public job board)
CREATE POLICY "Public can view active job offers" ON public.job_offers
FOR SELECT USING (status = 'active' OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can insert job offers" ON public.job_offers
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can update job offers" ON public.job_offers
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admin can delete job offers" ON public.job_offers
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 4. MISSIONS TABLE
DROP POLICY IF EXISTS "Allow public delete on missions" ON public.missions;
DROP POLICY IF EXISTS "Allow public insert on missions" ON public.missions;
DROP POLICY IF EXISTS "Allow public read on missions" ON public.missions;
DROP POLICY IF EXISTS "Allow public update on missions" ON public.missions;

CREATE POLICY "Staff can view missions" ON public.missions
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can insert missions" ON public.missions
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can update missions" ON public.missions
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admin can delete missions" ON public.missions
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 5. PAYROLLS TABLE
DROP POLICY IF EXISTS "Allow public delete on payrolls" ON public.payrolls;
DROP POLICY IF EXISTS "Allow public insert on payrolls" ON public.payrolls;
DROP POLICY IF EXISTS "Allow public read on payrolls" ON public.payrolls;
DROP POLICY IF EXISTS "Allow public update on payrolls" ON public.payrolls;

-- Payrolls are sensitive - admin only
CREATE POLICY "Admin can view payrolls" ON public.payrolls
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert payrolls" ON public.payrolls
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update payrolls" ON public.payrolls
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete payrolls" ON public.payrolls
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 6. EVENTS TABLE
DROP POLICY IF EXISTS "Allow public delete on events" ON public.events;
DROP POLICY IF EXISTS "Allow public insert on events" ON public.events;
DROP POLICY IF EXISTS "Allow public read on events" ON public.events;
DROP POLICY IF EXISTS "Allow public update on events" ON public.events;

CREATE POLICY "Staff can view events" ON public.events
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can insert events" ON public.events
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can update events" ON public.events
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admin can delete events" ON public.events
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 7. REPORTS TABLE
DROP POLICY IF EXISTS "Allow public delete on reports" ON public.reports;
DROP POLICY IF EXISTS "Allow public insert on reports" ON public.reports;
DROP POLICY IF EXISTS "Allow public read on reports" ON public.reports;
DROP POLICY IF EXISTS "Allow public update on reports" ON public.reports;

CREATE POLICY "Staff can view reports" ON public.reports
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can insert reports" ON public.reports
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can update reports" ON public.reports
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admin can delete reports" ON public.reports
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 8. TRAININGS TABLE
DROP POLICY IF EXISTS "Allow public delete on trainings" ON public.trainings;
DROP POLICY IF EXISTS "Allow public insert on trainings" ON public.trainings;
DROP POLICY IF EXISTS "Allow public read on trainings" ON public.trainings;
DROP POLICY IF EXISTS "Allow public update on trainings" ON public.trainings;

CREATE POLICY "Staff can view trainings" ON public.trainings
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can insert trainings" ON public.trainings
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can update trainings" ON public.trainings
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admin can delete trainings" ON public.trainings
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 9. TRAINING_PARTICIPANTS TABLE
DROP POLICY IF EXISTS "Allow public delete on training_participants" ON public.training_participants;
DROP POLICY IF EXISTS "Allow public insert on training_participants" ON public.training_participants;
DROP POLICY IF EXISTS "Allow public read on training_participants" ON public.training_participants;
DROP POLICY IF EXISTS "Allow public update on training_participants" ON public.training_participants;

CREATE POLICY "Staff can view training_participants" ON public.training_participants
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can insert training_participants" ON public.training_participants
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can update training_participants" ON public.training_participants
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admin can delete training_participants" ON public.training_participants
FOR DELETE USING (has_role(auth.uid(), 'admin'));
