/*
  # Migration pour corriger la récursion infinie dans les politiques RLS de la table users (Version 2)
  
  Le problème vient des politiques qui font référence à elles-mêmes ou créent des boucles.
  Cette migration supprime et recrée les politiques problématiques avec une approche différente.
*/

-- Supprimer TOUTES les politiques existantes sur la table users
DROP POLICY IF EXISTS "users_can_manage_own_data" ON public.users;
DROP POLICY IF EXISTS "admin_can_manage_all_users" ON public.users;
DROP POLICY IF EXISTS "admin_can_update_user_roles" ON public.users;
DROP POLICY IF EXISTS "admin_can_delete_users" ON public.users;
DROP POLICY IF EXISTS "public_can_view_users" ON public.users;
DROP POLICY IF EXISTS "allow_user_registration" ON public.users;
DROP POLICY IF EXISTS "public_can_view_user_profiles" ON public.users;

-- Recréer les politiques RLS de base sans récursion
-- Politique pour que les utilisateurs puissent voir et modifier leurs propres données
CREATE POLICY "users_can_manage_own_data"
ON public.users FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Politique pour que les admins puissent gérer tous les utilisateurs
-- Utiliser une approche plus simple pour éviter la récursion
-- Vérifier le rôle directement depuis auth.jwt() au lieu de faire une requête sur la table users
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

-- Vérifier que RLS est activé
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Commentaires pour la documentation
COMMENT ON POLICY "users_can_manage_own_data" ON public.users IS 'Permet aux utilisateurs de gérer leurs propres données';
COMMENT ON POLICY "admin_can_manage_all_users" ON public.users IS 'Permet aux admins de gérer tous les utilisateurs';
COMMENT ON POLICY "allow_user_registration" ON public.users IS 'Permet l''inscription de nouveaux utilisateurs';
COMMENT ON POLICY "public_can_view_user_profiles" ON public.users IS 'Permet la lecture des profils utilisateurs publics';
