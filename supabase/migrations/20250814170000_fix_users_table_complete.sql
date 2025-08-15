/*
  # Migration pour corriger complètement la table users
  
  Cette migration corrige tous les problèmes de la table users :
  - Recrée les politiques RLS manquantes
  - Recrée les triggers pour updated_at
  - S'assure que la structure est complète
*/

-- 1. Vérifier et corriger la structure de la table users
-- Ajouter le champ updated_at s'il n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE public.users ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- 2. Supprimer toutes les politiques existantes sur la table users
DROP POLICY IF EXISTS "users_can_manage_own_data" ON public.users;
DROP POLICY IF EXISTS "admin_can_manage_all_users" ON public.users;
DROP POLICY IF EXISTS "admin_can_update_user_roles" ON public.users;
DROP POLICY IF EXISTS "admin_can_delete_users" ON public.users;
DROP POLICY IF EXISTS "public_can_view_users" ON public.users;
DROP POLICY IF EXISTS "allow_user_registration" ON public.users;
DROP POLICY IF EXISTS "public_can_view_user_profiles" ON public.users;

-- 3. Recréer les politiques RLS de base sans récursion
-- Politique pour que les utilisateurs puissent voir et modifier leurs propres données
CREATE POLICY "users_can_manage_own_data"
ON public.users FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Politique pour que les admins puissent gérer tous les utilisateurs
-- Utiliser une approche plus simple pour éviter la récursion
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

-- Politique pour permettre la lecture des profils publics (nom, prénom, etc.)
CREATE POLICY "public_can_view_user_profiles"
ON public.users FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Vérifier que la fonction update_updated_at_column existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Recréer les triggers pour la table users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Vérifier que RLS est activé
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 7. S'assurer que la table users a tous les champs nécessaires
-- Ajouter des champs manquants s'ils n'existent pas
DO $$ 
BEGIN
    -- Champ role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE public.users ADD COLUMN role text DEFAULT 'user';
    END IF;
    
    -- Champ active_role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'active_role') THEN
        ALTER TABLE public.users ADD COLUMN active_role text DEFAULT 'user';
    END IF;
    
    -- Champ profile_completed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile_completed') THEN
        ALTER TABLE public.users ADD COLUMN profile_completed boolean DEFAULT false;
    END IF;
    
    -- Champ newsletter
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'newsletter') THEN
        ALTER TABLE public.users ADD COLUMN newsletter boolean DEFAULT false;
    END IF;
    
    -- Champ cgv_accepted
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'cgv_accepted') THEN
        ALTER TABLE public.users ADD COLUMN cgv_accepted boolean DEFAULT false;
    END IF;
    
    -- Champ cgv_accepted_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'cgv_accepted_at') THEN
        ALTER TABLE public.users ADD COLUMN cgv_accepted_at timestamptz;
    END IF;
    
    -- Champ genre
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'genre') THEN
        ALTER TABLE public.users ADD COLUMN genre text;
    END IF;
    
    -- Champ date_naissance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'date_naissance') THEN
        ALTER TABLE public.users ADD COLUMN date_naissance date;
    END IF;
END $$;

-- 8. Commentaires pour la documentation
COMMENT ON POLICY "users_can_manage_own_data" ON public.users IS 'Permet aux utilisateurs de gérer leurs propres données';
COMMENT ON POLICY "admin_can_manage_all_users" ON public.users IS 'Permet aux admins de gérer tous les utilisateurs';
COMMENT ON POLICY "allow_user_registration" ON public.users IS 'Permet l''inscription de nouveaux utilisateurs';
COMMENT ON POLICY "public_can_view_user_profiles" ON public.users IS 'Permet la lecture des profils utilisateurs publics';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Fonction pour mettre à jour automatiquement le champ updated_at';
COMMENT ON TRIGGER update_users_updated_at ON public.users IS 'Trigger pour mettre à jour automatiquement updated_at lors des modifications';
