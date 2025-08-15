/*
  # Migration directe pour corriger la table users
  
  Cette migration utilise une approche directe pour s'assurer que le champ updated_at existe.
*/

-- 1. Vérifier et corriger la structure de la table users
-- Utiliser une approche plus directe avec des blocs d'exception

-- Essayer d'ajouter le champ updated_at directement
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.users ADD COLUMN updated_at timestamptz DEFAULT now();
        RAISE NOTICE 'Champ updated_at ajouté avec succès';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Le champ updated_at existe déjà';
        WHEN OTHERS THEN
            RAISE NOTICE 'Erreur lors de l''ajout du champ updated_at: %', SQLERRM;
    END;
END $$;

-- 2. Vérifier que le champ existe maintenant
DO $$
DECLARE
    col_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'updated_at' 
        AND table_schema = 'public'
    ) INTO col_exists;
    
    IF col_exists THEN
        RAISE NOTICE '✅ Le champ updated_at existe maintenant dans la table users';
    ELSE
        RAISE NOTICE '❌ Le champ updated_at n''existe toujours pas dans la table users';
    END IF;
END $$;

-- 3. S'assurer que la fonction update_updated_at_column existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recréer le trigger pour la table users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Vérifier que RLS est activé
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. Recréer les politiques RLS de base
DROP POLICY IF EXISTS "users_can_manage_own_data" ON public.users;
DROP POLICY IF EXISTS "admin_can_manage_all_users" ON public.users;
DROP POLICY IF EXISTS "allow_user_registration" ON public.users;
DROP POLICY IF EXISTS "public_can_view_user_profiles" ON public.users;

-- Politique pour que les utilisateurs puissent voir et modifier leurs propres données
CREATE POLICY "users_can_manage_own_data"
ON public.users FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Politique pour que les admins puissent gérer tous les utilisateurs
CREATE POLICY "admin_can_manage_all_users"
ON public.users FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Politique pour permettre la création de nouveaux utilisateurs (inscription)
CREATE POLICY "allow_user_registration"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (true);

-- Politique pour permettre la lecture des profils publics
CREATE POLICY "public_can_view_user_profiles"
ON public.users FOR SELECT
TO anon, authenticated
USING (true);

-- 7. Commentaires pour la documentation
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Fonction pour mettre à jour automatiquement le champ updated_at';
COMMENT ON TRIGGER update_users_updated_at ON public.users IS 'Trigger pour mettre à jour automatiquement updated_at lors des modifications';
