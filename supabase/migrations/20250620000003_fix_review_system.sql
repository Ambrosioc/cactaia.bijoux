/*
  # Correction du système d'avis
  
  Problème : Les jointures utilisent auth.users au lieu de public.users
  Solution : Corriger les vues et fonctions pour utiliser la bonne table
*/

-- Supprimer la vue problématique
DROP VIEW IF EXISTS public.review_with_user;

-- Recréer la vue avec la bonne jointure
CREATE OR REPLACE VIEW public.review_with_user AS
SELECT 
  r.*,
  usr.nom as user_nom,
  usr.prenom as user_prenom,
  p.nom as product_name
FROM public.reviews r
JOIN public.users usr ON r.user_id = usr.id
JOIN public.produits p ON r.product_id = p.id
WHERE r.status = 'approved';

-- Corriger les politiques pour utiliser public.users
DROP POLICY IF EXISTS "admin_can_manage_all_reviews" ON public.reviews;
CREATE POLICY "admin_can_manage_all_reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Corriger les politiques pour review_reports
DROP POLICY IF EXISTS "admin_can_view_reports" ON public.review_reports;
CREATE POLICY "admin_can_view_reports"
ON public.review_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

DROP POLICY IF EXISTS "admin_can_manage_reports" ON public.review_reports;
CREATE POLICY "admin_can_manage_reports"
ON public.review_reports
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Ajouter des colonnes manquantes si elles n'existent pas
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS moderation_reason text,
ADD COLUMN IF NOT EXISTS moderated_at timestamptz;

-- Commentaires pour la documentation
COMMENT ON VIEW public.review_with_user IS 'Vue pour afficher les avis avec les informations utilisateur et produit'; 