/*
  # Correction des politiques RLS pour la gestion des rôles administrateurs

  1. Sécurité
    - Correction du conflit avec le mot réservé current_user
    - Seuls les administrateurs peuvent modifier les rôles
    - Un utilisateur ne peut pas se promouvoir lui-même
    - Protection contre l'auto-suppression des admins
    - Garantie qu'il reste toujours au moins un admin

  2. Nouvelles politiques corrigées
    - Politique pour la promotion/rétrogradation des rôles
    - Politique pour la suppression sécurisée des utilisateurs
    - Fonction et trigger pour maintenir l'intégrité des admins
*/

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "admin_can_update_user_roles" ON public.users;
DROP POLICY IF EXISTS "admin_can_delete_users" ON public.users;

-- Supprimer l'ancien trigger et fonction si ils existent
DROP TRIGGER IF EXISTS ensure_admin_exists_trigger ON public.users;
DROP FUNCTION IF EXISTS public.ensure_admin_exists();

-- Politique pour permettre aux admins de modifier les rôles d'autres utilisateurs
CREATE POLICY "admin_can_update_user_roles"
ON public.users
FOR UPDATE
TO authenticated
USING (
  -- L'utilisateur qui fait la modification doit être admin
  EXISTS (
    SELECT 1 FROM public.users cu
    WHERE cu.id = auth.uid() 
    AND cu.role = 'admin'
  )
  -- Et il ne peut pas modifier son propre rôle (sécurité)
  AND id != auth.uid()
);

-- Politique pour permettre aux admins de supprimer d'autres utilisateurs
CREATE POLICY "admin_can_delete_users"
ON public.users
FOR DELETE
TO authenticated
USING (
  -- L'utilisateur qui fait la suppression doit être admin
  EXISTS (
    SELECT 1 FROM public.users cu
    WHERE cu.id = auth.uid() 
    AND cu.role = 'admin'
  )
  -- Et il ne peut pas se supprimer lui-même (sécurité)
  AND id != auth.uid()
);

-- Fonction pour vérifier qu'il reste au moins un admin
CREATE OR REPLACE FUNCTION public.ensure_admin_exists()
RETURNS trigger AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Pour les opérations UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Si on essaie de rétrograder un admin
    IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
      -- Compter les admins restants (excluant celui qu'on modifie)
      SELECT COUNT(*) INTO admin_count
      FROM public.users 
      WHERE role = 'admin' AND id != NEW.id;
      
      -- Si c'est le dernier admin, empêcher l'action
      IF admin_count = 0 THEN
        RAISE EXCEPTION 'Impossible de rétrograder le dernier administrateur';
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Pour les opérations DELETE
  IF TG_OP = 'DELETE' THEN
    -- Si on essaie de supprimer un admin
    IF OLD.role = 'admin' THEN
      -- Compter les admins restants (excluant celui qu'on supprime)
      SELECT COUNT(*) INTO admin_count
      FROM public.users 
      WHERE role = 'admin' AND id != OLD.id;
      
      -- Si c'est le dernier admin, empêcher l'action
      IF admin_count = 0 THEN
        RAISE EXCEPTION 'Impossible de supprimer le dernier administrateur';
      END IF;
    END IF;
    
    RETURN OLD;
  END IF;
  
  -- Par défaut, retourner l'enregistrement approprié
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour s'assurer qu'il reste toujours au moins un admin
CREATE TRIGGER ensure_admin_exists_trigger
  BEFORE UPDATE OR DELETE ON public.users
  FOR EACH ROW 
  EXECUTE PROCEDURE public.ensure_admin_exists();

-- Fonction pour permettre aux admins de changer leur rôle actif (mise à jour)
CREATE OR REPLACE FUNCTION public.switch_active_role(new_active_role text)
RETURNS void AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
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