
-- Create enums for personnel
CREATE TYPE public.civilite AS ENUM ('Mr', 'Mle', 'Mme');
CREATE TYPE public.situation_familiale AS ENUM ('C', 'M', 'D');
CREATE TYPE public.mode_paiement AS ENUM ('espece', 'cheque', 'virement');

-- Create sequence for matricule
CREATE SEQUENCE public.personnel_matricule_seq START 1;

-- Create personnel table
CREATE TABLE public.personnel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricule VARCHAR NOT NULL UNIQUE,
  
  -- Informations générales
  nom VARCHAR NOT NULL,
  prenom VARCHAR NOT NULL,
  nom_jeune_fille VARCHAR,
  civilite public.civilite NOT NULL DEFAULT 'Mr',
  adresse TEXT,
  complement_adresse TEXT,
  code_postal VARCHAR(10),
  ville VARCHAR(100),
  telephone1 VARCHAR(20),
  telephone2 VARCHAR(20),
  date_naissance DATE,
  nationalite VARCHAR(50),
  situation_familiale public.situation_familiale DEFAULT 'C',
  
  -- Informations administratives
  type_document VARCHAR(50) DEFAULT 'CIN',
  numero_document VARCHAR(50),
  date_validite_document DATE,
  qualification VARCHAR(255),
  date_entree DATE,
  date_fin_mission DATE,
  date_premiere_paie DATE,
  
  -- Informations de paiement
  mode_paiement public.mode_paiement DEFAULT 'virement',
  rib VARCHAR(24),
  domiciliation_bancaire VARCHAR(255),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;

-- Create trigger for auto-generating matricule
CREATE OR REPLACE FUNCTION public.generate_personnel_matricule()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.matricule IS NULL OR NEW.matricule = '' THEN
    NEW.matricule = 'INT' || LPAD(nextval('public.personnel_matricule_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_personnel_matricule_trigger
BEFORE INSERT ON public.personnel
FOR EACH ROW
EXECUTE FUNCTION public.generate_personnel_matricule();

-- Create trigger for updated_at
CREATE TRIGGER update_personnel_updated_at
BEFORE UPDATE ON public.personnel
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
CREATE POLICY "Staff can view personnel"
ON public.personnel FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can insert personnel"
ON public.personnel FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can update personnel"
ON public.personnel FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admin can delete personnel"
ON public.personnel FOR DELETE
USING (has_role(auth.uid(), 'admin'));
