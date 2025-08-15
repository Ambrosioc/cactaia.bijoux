/*
  # Migration pour forcer l'ajout du champ updated_at à la table users
  
  Cette migration force l'ajout du champ updated_at même s'il semble exister.
*/

-- 1. Ajouter le champ updated_at (sans essayer de le supprimer d'abord)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE public.users ADD COLUMN updated_at timestamptz DEFAULT now();
        RAISE NOTICE 'Champ updated_at ajouté à la table users';
    ELSE
        RAISE NOTICE 'Le champ updated_at existe déjà dans la table users';
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'Le champ updated_at existe déjà, on continue...';
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de l''ajout du champ updated_at: %', SQLERRM;
END $$;

-- 2. S'assurer que la fonction update_updated_at_column existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recréer le trigger pour la table users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Vérifier que RLS est activé
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Recréer les politiques RLS de base
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

-- 6. Commentaires pour la documentation
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Fonction pour mettre à jour automatiquement le champ updated_at';
COMMENT ON TRIGGER update_users_updated_at ON public.users IS 'Trigger pour mettre à jour automatiquement updated_at lors des modifications';
