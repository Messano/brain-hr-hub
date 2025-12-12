-- Modifier le trigger pour ne pas insérer de rôle automatiquement
-- L'attribution du rôle sera gérée par l'application après la création de l'utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Créer le profil utilisateur
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Ne pas insérer de rôle ici - sera géré par l'application
  -- Cela permet d'attribuer n'importe quel rôle lors de la création
  
  RETURN NEW;
END;
$$;