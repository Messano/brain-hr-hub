-- Enum types
CREATE TYPE public.client_type AS ENUM ('C1', 'C2', 'C9');
CREATE TYPE public.payment_mode AS ENUM ('cheque', 'traite', 'virement');
CREATE TYPE public.tva_type AS ENUM ('normale', 'exoneree', 'reduite');
CREATE TYPE public.invoice_mode AS ENUM ('global', 'salarie', 'commande');
CREATE TYPE public.job_status AS ENUM ('active', 'closed', 'draft');
CREATE TYPE public.job_type AS ENUM ('cdi', 'cdd', 'interim', 'freelance', 'stage');
CREATE TYPE public.candidate_status AS ENUM ('new', 'reviewing', 'interview', 'offer', 'hired', 'rejected');
CREATE TYPE public.mission_status AS ENUM ('active', 'completed', 'pending', 'cancelled');
CREATE TYPE public.training_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.payroll_status AS ENUM ('paid', 'pending', 'processing');
CREATE TYPE public.event_type AS ENUM ('meeting', 'interview', 'training', 'deadline', 'other');

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  raison_sociale VARCHAR(255) NOT NULL,
  titre VARCHAR(10), -- SA, SOC, SAR
  adresse TEXT,
  adresse_facturation TEXT,
  telephone VARCHAR(20),
  email VARCHAR(255),
  -- Facturation
  mode_reglement payment_mode DEFAULT 'virement',
  delai_reglement INTEGER DEFAULT 30,
  code_comptable VARCHAR(50),
  type_client client_type DEFAULT 'C1',
  facturation_cp BOOLEAN DEFAULT false,
  code_ice VARCHAR(50),
  -- Coefficients
  coef_heures_normales DECIMAL(5,2) DEFAULT 1.00,
  coef_heures_sup_25 DECIMAL(5,2) DEFAULT 1.25,
  coef_heures_sup_50 DECIMAL(5,2) DEFAULT 1.50,
  coef_heures_sup_100 DECIMAL(5,2) DEFAULT 2.00,
  coef_heures_feriees DECIMAL(5,2) DEFAULT 2.00,
  coef_indemnites_soumises DECIMAL(5,2) DEFAULT 1.00,
  coef_indemnites_non_soumises DECIMAL(5,2) DEFAULT 1.00,
  coef_conge_paye DECIMAL(5,2) DEFAULT 1.00,
  coef_prime DECIMAL(5,2) DEFAULT 1.00,
  -- Travail
  duree_hebdomadaire INTEGER DEFAULT 44,
  horaires_travail TEXT,
  -- Paramètres système
  activation_stc BOOLEAN DEFAULT false,
  tva tva_type DEFAULT 'normale',
  mode_edition_facture invoice_mode DEFAULT 'global',
  -- Contact
  contact_nom VARCHAR(255),
  contact_telephone VARCHAR(20),
  contact_email VARCHAR(255),
  -- Commercial
  code_commercial VARCHAR(50),
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job offers table
CREATE TABLE public.job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(255),
  job_type job_type DEFAULT 'cdi',
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT,
  responsibilities TEXT[],
  requirements TEXT[],
  benefits TEXT[],
  status job_status DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_offer_id UUID REFERENCES public.job_offers(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cv_url TEXT,
  cover_letter TEXT,
  status candidate_status DEFAULT 'new',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Missions table
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  daily_rate DECIMAL(10,2),
  mission_type VARCHAR(50), -- Régie, Forfait
  status mission_status DEFAULT 'pending',
  contract_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trainings table
CREATE TABLE public.trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  trainer VARCHAR(255),
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  duration_hours INTEGER,
  max_participants INTEGER,
  category VARCHAR(100),
  status training_status DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Training participants
CREATE TABLE public.training_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES public.trainings(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(training_id, candidate_id)
);

-- Payroll table
CREATE TABLE public.payrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
  mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL,
  bonus DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  status payroll_status DEFAULT 'pending',
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Planning events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type event_type DEFAULT 'meeting',
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  attendees TEXT[],
  related_mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  related_training_id UUID REFERENCES public.trainings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(100),
  filters JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'ready',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables (but with public access for now since no auth)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies for all tables (will restrict with auth later)
CREATE POLICY "Allow public read on clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert on clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Allow public read on job_offers" ON public.job_offers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on job_offers" ON public.job_offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on job_offers" ON public.job_offers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on job_offers" ON public.job_offers FOR DELETE USING (true);

CREATE POLICY "Allow public read on candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Allow public insert on candidates" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on candidates" ON public.candidates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on candidates" ON public.candidates FOR DELETE USING (true);

CREATE POLICY "Allow public read on missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on missions" ON public.missions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on missions" ON public.missions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on missions" ON public.missions FOR DELETE USING (true);

CREATE POLICY "Allow public read on trainings" ON public.trainings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on trainings" ON public.trainings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on trainings" ON public.trainings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on trainings" ON public.trainings FOR DELETE USING (true);

CREATE POLICY "Allow public read on training_participants" ON public.training_participants FOR SELECT USING (true);
CREATE POLICY "Allow public insert on training_participants" ON public.training_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on training_participants" ON public.training_participants FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on training_participants" ON public.training_participants FOR DELETE USING (true);

CREATE POLICY "Allow public read on payrolls" ON public.payrolls FOR SELECT USING (true);
CREATE POLICY "Allow public insert on payrolls" ON public.payrolls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on payrolls" ON public.payrolls FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on payrolls" ON public.payrolls FOR DELETE USING (true);

CREATE POLICY "Allow public read on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public insert on events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on events" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on events" ON public.events FOR DELETE USING (true);

CREATE POLICY "Allow public read on reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert on reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on reports" ON public.reports FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on reports" ON public.reports FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_offers_updated_at BEFORE UPDATE ON public.job_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON public.trainings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payrolls_updated_at BEFORE UPDATE ON public.payrolls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create sequence for client codes
CREATE SEQUENCE public.client_code_seq START 1;

-- Function to generate client code
CREATE OR REPLACE FUNCTION public.generate_client_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code = 'CLI' || LPAD(nextval('public.client_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_client_code_trigger BEFORE INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.generate_client_code();