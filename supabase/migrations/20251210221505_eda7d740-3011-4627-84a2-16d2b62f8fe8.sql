-- Add mission_id to contracts table to link contracts to missions
ALTER TABLE public.contracts ADD COLUMN mission_id uuid REFERENCES public.missions(id);

-- Add personnel_id to missions table to link missions to personnel
ALTER TABLE public.missions ADD COLUMN personnel_id uuid REFERENCES public.personnel(id);

-- Create indexes for better performance
CREATE INDEX idx_contracts_mission_id ON public.contracts(mission_id);
CREATE INDEX idx_missions_personnel_id ON public.missions(personnel_id);