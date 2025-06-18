/*
  # Correction des politiques RLS pour éviter l'infinite recursion

  1. Suppression des anciennes politiques
  2. Création de nouvelles politiques simples et directes
  3. Éviter les requêtes imbriquées dans les politiques
*/

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Politique simple pour que les utilisateurs puissent lire leur propre profil
CREATE POLICY "read_own_user"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Politique pour que les utilisateurs puissent mettre à jour leur propre profil
CREATE POLICY "update_own_user"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Politique pour l'insertion (nécessaire pour le trigger)
CREATE POLICY "insert_own_user"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Politique pour que les admins puissent tout voir (sans sous-requête)
-- Note: Cette politique sera activée seulement si nécessaire
-- CREATE POLICY "admin_read_all"
-- ON public.users
-- FOR SELECT
-- TO authenticated
-- USING (
--   auth.jwt() ->> 'role' = 'admin'
-- );