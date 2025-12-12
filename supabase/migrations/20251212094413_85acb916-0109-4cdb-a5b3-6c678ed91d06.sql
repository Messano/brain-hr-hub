-- Add personnel_id column to payrolls table
ALTER TABLE public.payrolls ADD COLUMN personnel_id uuid REFERENCES public.personnel(id);

-- Create index for better performance
CREATE INDEX idx_payrolls_personnel_id ON public.payrolls(personnel_id);