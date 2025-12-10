-- Create enum for contract type
CREATE TYPE public.contract_type AS ENUM ('nouveau', 'modification', 'renouvellement', 'avenant', 'duplicata');

-- Create enum for trial period
CREATE TYPE public.trial_period AS ENUM ('2_jours', '3_jours', '5_jours');

-- Create enum for contract status
CREATE TYPE public.contract_status AS ENUM ('brouillon', 'actif', 'termine', 'annule');

-- Create sequence for contract number
CREATE SEQUENCE public.contract_number_seq START 1;

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_contrat VARCHAR NOT NULL UNIQUE,
  
  -- Informations de base
  type_contrat contract_type NOT NULL DEFAULT 'nouveau',
  date_debut DATE NOT NULL,
  date_fin DATE,
  date_entree_fonction DATE,
  periode_essai trial_period DEFAULT '3_jours',
  motif_recours TEXT,
  justificatif TEXT,
  caracteristiques_poste TEXT,
  lieu_travail VARCHAR,
  numero_commande VARCHAR,
  
  -- Informations financières
  salaire_reference NUMERIC(10,2),
  taux_horaire NUMERIC(10,2),
  coefficient_facturation NUMERIC(5,2) DEFAULT 1.00,
  indemnites_non_soumises_rubrique VARCHAR,
  indemnites_non_soumises_montant NUMERIC(10,2) DEFAULT 0,
  
  -- Relations
  client_id UUID REFERENCES public.clients(id),
  personnel_id UUID REFERENCES public.personnel(id),
  
  -- Metadata
  status contract_status DEFAULT 'brouillon',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to generate contract number
CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.numero_contrat IS NULL OR NEW.numero_contrat = '' THEN
    NEW.numero_contrat = 'CTT' || TO_CHAR(NOW(), 'YYYY') || LPAD(nextval('public.contract_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating contract number
CREATE TRIGGER generate_contract_number_trigger
BEFORE INSERT ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.generate_contract_number();

-- Create trigger for updating updated_at
CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view contracts"
ON public.contracts FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can insert contracts"
ON public.contracts FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can update contracts"
ON public.contracts FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admin can delete contracts"
ON public.contracts FOR DELETE
USING (has_role(auth.uid(), 'admin'));