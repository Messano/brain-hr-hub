-- Invoice status enum
CREATE TYPE public.invoice_status AS ENUM ('draft', 'pending', 'sent', 'paid', 'cancelled');

-- Main invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT NOT NULL,
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  -- Amounts
  total_ht NUMERIC NOT NULL DEFAULT 0,
  total_tva NUMERIC NOT NULL DEFAULT 0,
  total_ttc NUMERIC NOT NULL DEFAULT 0,
  -- Status and dates
  status invoice_status DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_date DATE,
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoice lines for each worker/contract
CREATE TABLE public.invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES public.contracts(id),
  personnel_id UUID REFERENCES public.personnel(id),
  -- Hours breakdown
  heures_normales NUMERIC DEFAULT 0,
  heures_sup_25 NUMERIC DEFAULT 0,
  heures_sup_50 NUMERIC DEFAULT 0,
  heures_sup_100 NUMERIC DEFAULT 0,
  heures_feriees NUMERIC DEFAULT 0,
  -- Amounts
  indemnites_soumises NUMERIC DEFAULT 0,
  indemnites_non_soumises NUMERIC DEFAULT 0,
  conge_paye NUMERIC DEFAULT 0,
  prime NUMERIC DEFAULT 0,
  -- Calculated totals
  montant_ht NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sequence for invoice numbers
CREATE SEQUENCE public.invoice_number_seq START 1;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number = 'FAC' || TO_CHAR(NOW(), 'YYYY') || LPAD(nextval('public.invoice_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for auto-generating invoice number
CREATE TRIGGER generate_invoice_number_trigger
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.generate_invoice_number();

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Admin can view invoices"
ON public.invoices FOR SELECT
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert invoices"
ON public.invoices FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update invoices"
ON public.invoices FOR UPDATE
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete invoices"
ON public.invoices FOR DELETE
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for invoice_lines
CREATE POLICY "Admin can view invoice_lines"
ON public.invoice_lines FOR SELECT
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert invoice_lines"
ON public.invoice_lines FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update invoice_lines"
ON public.invoice_lines FOR UPDATE
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete invoice_lines"
ON public.invoice_lines FOR DELETE
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));