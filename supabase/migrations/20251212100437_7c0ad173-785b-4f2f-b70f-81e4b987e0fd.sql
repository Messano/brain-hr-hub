-- Add personnel_id column to training_participants table
ALTER TABLE public.training_participants 
ADD COLUMN personnel_id uuid REFERENCES public.personnel(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_training_participants_personnel_id ON public.training_participants(personnel_id);