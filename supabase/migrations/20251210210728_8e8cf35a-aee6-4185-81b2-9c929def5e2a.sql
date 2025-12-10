-- Create contract_history table for tracking changes
CREATE TABLE public.contract_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_type TEXT NOT NULL, -- 'creation', 'modification', 'status_change'
  changes JSONB, -- stores the changed fields and their old/new values
  snapshot JSONB NOT NULL -- full contract state at this version
);

-- Enable RLS
ALTER TABLE public.contract_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Staff can view contract history"
ON public.contract_history
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can insert contract history"
ON public.contract_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Index for faster queries
CREATE INDEX idx_contract_history_contract_id ON public.contract_history(contract_id);
CREATE INDEX idx_contract_history_changed_at ON public.contract_history(changed_at DESC);