-- Update all RLS policies to include super_admin role

-- CLIENTS
DROP POLICY IF EXISTS "Staff can view clients" ON public.clients;
CREATE POLICY "Staff can view clients" ON public.clients
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can insert clients" ON public.clients;
CREATE POLICY "Staff can insert clients" ON public.clients
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can update clients" ON public.clients;
CREATE POLICY "Staff can update clients" ON public.clients
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete clients" ON public.clients;
CREATE POLICY "Admin can delete clients" ON public.clients
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- PERSONNEL
DROP POLICY IF EXISTS "Staff can view personnel" ON public.personnel;
CREATE POLICY "Staff can view personnel" ON public.personnel
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can insert personnel" ON public.personnel;
CREATE POLICY "Staff can insert personnel" ON public.personnel
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can update personnel" ON public.personnel;
CREATE POLICY "Staff can update personnel" ON public.personnel
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete personnel" ON public.personnel;
CREATE POLICY "Admin can delete personnel" ON public.personnel
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- CONTRACTS
DROP POLICY IF EXISTS "Staff can view contracts" ON public.contracts;
CREATE POLICY "Staff can view contracts" ON public.contracts
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can insert contracts" ON public.contracts;
CREATE POLICY "Staff can insert contracts" ON public.contracts
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can update contracts" ON public.contracts;
CREATE POLICY "Staff can update contracts" ON public.contracts
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete contracts" ON public.contracts;
CREATE POLICY "Admin can delete contracts" ON public.contracts
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- MISSIONS
DROP POLICY IF EXISTS "Staff can view missions" ON public.missions;
CREATE POLICY "Staff can view missions" ON public.missions
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can insert missions" ON public.missions;
CREATE POLICY "Staff can insert missions" ON public.missions
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can update missions" ON public.missions;
CREATE POLICY "Staff can update missions" ON public.missions
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete missions" ON public.missions;
CREATE POLICY "Admin can delete missions" ON public.missions
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- CANDIDATES
DROP POLICY IF EXISTS "Staff can view candidates" ON public.candidates;
CREATE POLICY "Staff can view candidates" ON public.candidates
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can update candidates" ON public.candidates;
CREATE POLICY "Staff can update candidates" ON public.candidates
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete candidates" ON public.candidates;
CREATE POLICY "Admin can delete candidates" ON public.candidates
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- TRAININGS
DROP POLICY IF EXISTS "Staff can view trainings" ON public.trainings;
CREATE POLICY "Staff can view trainings" ON public.trainings
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can insert trainings" ON public.trainings;
CREATE POLICY "Staff can insert trainings" ON public.trainings
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can update trainings" ON public.trainings;
CREATE POLICY "Staff can update trainings" ON public.trainings
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete trainings" ON public.trainings;
CREATE POLICY "Admin can delete trainings" ON public.trainings
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- TRAINING_PARTICIPANTS
DROP POLICY IF EXISTS "Staff can view training_participants" ON public.training_participants;
CREATE POLICY "Staff can view training_participants" ON public.training_participants
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can insert training_participants" ON public.training_participants;
CREATE POLICY "Staff can insert training_participants" ON public.training_participants
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can update training_participants" ON public.training_participants;
CREATE POLICY "Staff can update training_participants" ON public.training_participants
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete training_participants" ON public.training_participants;
CREATE POLICY "Admin can delete training_participants" ON public.training_participants
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- PAYROLLS
DROP POLICY IF EXISTS "Admin can view payrolls" ON public.payrolls;
CREATE POLICY "Admin can view payrolls" ON public.payrolls
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admin can insert payrolls" ON public.payrolls;
CREATE POLICY "Admin can insert payrolls" ON public.payrolls
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admin can update payrolls" ON public.payrolls;
CREATE POLICY "Admin can update payrolls" ON public.payrolls
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete payrolls" ON public.payrolls;
CREATE POLICY "Admin can delete payrolls" ON public.payrolls
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- EVENTS
DROP POLICY IF EXISTS "Staff can view events" ON public.events;
CREATE POLICY "Staff can view events" ON public.events
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can insert events" ON public.events;
CREATE POLICY "Staff can insert events" ON public.events
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can update events" ON public.events;
CREATE POLICY "Staff can update events" ON public.events
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete events" ON public.events;
CREATE POLICY "Admin can delete events" ON public.events
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- REPORTS
DROP POLICY IF EXISTS "Staff can view reports" ON public.reports;
CREATE POLICY "Staff can view reports" ON public.reports
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can insert reports" ON public.reports;
CREATE POLICY "Staff can insert reports" ON public.reports
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can update reports" ON public.reports;
CREATE POLICY "Staff can update reports" ON public.reports
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete reports" ON public.reports;
CREATE POLICY "Admin can delete reports" ON public.reports
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- JOB_OFFERS
DROP POLICY IF EXISTS "Public can view active job offers" ON public.job_offers;
CREATE POLICY "Public can view active job offers" ON public.job_offers
FOR SELECT USING (
  status = 'active'::job_status OR
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can insert job offers" ON public.job_offers;
CREATE POLICY "Staff can insert job offers" ON public.job_offers
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can update job offers" ON public.job_offers;
CREATE POLICY "Staff can update job offers" ON public.job_offers
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Admin can delete job offers" ON public.job_offers;
CREATE POLICY "Admin can delete job offers" ON public.job_offers
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- CONTRACT_HISTORY
DROP POLICY IF EXISTS "Staff can view contract history" ON public.contract_history;
CREATE POLICY "Staff can view contract history" ON public.contract_history
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Staff can insert contract history" ON public.contract_history;
CREATE POLICY "Staff can insert contract history" ON public.contract_history
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);