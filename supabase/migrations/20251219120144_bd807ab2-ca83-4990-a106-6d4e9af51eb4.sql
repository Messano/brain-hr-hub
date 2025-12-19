-- Create a table to store read notifications
CREATE TABLE public.read_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_key TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_key)
);

-- Enable RLS
ALTER TABLE public.read_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own read notifications
CREATE POLICY "Users can view their own read notifications"
ON public.read_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own read notifications
CREATE POLICY "Users can insert their own read notifications"
ON public.read_notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own read notifications
CREATE POLICY "Users can delete their own read notifications"
ON public.read_notifications
FOR DELETE
USING (auth.uid() = user_id);