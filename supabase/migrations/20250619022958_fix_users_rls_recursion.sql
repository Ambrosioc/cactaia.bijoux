/*
  # Correction de la récursion infinie dans les politiques RLS de la table users

  Le problème vient des politiques qui font des requêtes sur la table users elle-même,
  créant une récursion infinie. Solution : utiliser des fonctions SECURITY DEFINER
  qui contournent les politiques RLS.
*/

-- Supprimer les politiques problématiques
DROP POLICY IF EXISTS "admin_can_update_user_roles" ON public.users;
DROP POLICY IF EXISTS "admin_can_delete_users" ON public.users;

-- Fonction pour vérifier si l'utilisateur est admin (contourne RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur peut modifier un autre utilisateur
CREATE OR REPLACE FUNCTION public.can_modify_user(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- L'utilisateur peut modifier son propre profil
  IF target_user_id = auth.uid() THEN
    RETURN true;
  END IF;
  
  -- Les admins peuvent modifier d'autres utilisateurs
  IF public.is_admin() THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nouvelle politique pour les mises à jour (sans récursion)
CREATE POLICY "users_can_update_own_profile"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Politique pour que les admins puissent modifier d'autres utilisateurs
CREATE POLICY "admins_can_update_other_users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  id != auth.uid() AND 
  public.is_admin()
);

-- Politique pour la suppression (seuls les admins peuvent supprimer d'autres utilisateurs)
CREATE POLICY "admins_can_delete_other_users"
ON public.users
FOR DELETE
TO authenticated
USING (
  id != auth.uid() AND 
  public.is_admin()
);

-- Mettre à jour la fonction switch_active_role pour utiliser la nouvelle fonction
CREATE OR REPLACE FUNCTION public.switch_active_role(new_active_role text)
RETURNS void AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent changer de rôle actif';
  END IF;

  -- Vérifier que le nouveau rôle est valide
  IF new_active_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Rôle actif invalide';
  END IF;

  -- Mettre à jour le rôle actif
  UPDATE public.users
  SET active_role = new_active_role
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


