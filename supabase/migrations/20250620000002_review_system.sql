/*
  # Système d'Avis Clients

  1. Nouvelles Tables
    - `reviews` : Avis des clients sur les produits
    - `review_votes` : Votes utiles/pas utiles sur les avis
    - `review_reports` : Signalements d'avis inappropriés

  2. Fonctionnalités
    - Système de notation 1-5 étoiles
    - Avis vérifiés (achat confirmé)
    - Modération des avis
    - Système de votes utiles/pas utiles
    - Signalement d'avis inappropriés
    - Statistiques et agrégation des notes
*/

-- Table des avis clients
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.commandes(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  comment text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_votes integer DEFAULT 0,
  total_votes integer DEFAULT 0,
  is_verified_purchase boolean DEFAULT false,
  moderated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  moderation_reason text,
  moderated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des votes sur les avis
CREATE TABLE IF NOT EXISTS public.review_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Table des signalements d'avis
CREATE TABLE IF NOT EXISTS public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Politiques pour reviews
CREATE POLICY "users_can_view_approved_reviews"
ON public.reviews
FOR SELECT
TO authenticated, anon
USING (status = 'approved');

CREATE POLICY "users_can_view_own_reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_can_create_reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending');

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

-- Politiques pour review_votes
CREATE POLICY "users_can_view_votes"
ON public.review_votes
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "users_can_create_votes"
ON public.review_votes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_votes"
ON public.review_votes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Politiques pour review_reports
CREATE POLICY "users_can_create_reports"
ON public.review_reports
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

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

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON public.reviews(is_verified_purchase);

CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON public.review_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON public.review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON public.review_reports(status);

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON public.reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating ON public.reviews(product_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_user_status ON public.reviews(user_id, status);

-- Fonction pour calculer les statistiques d'avis d'un produit
CREATE OR REPLACE FUNCTION public.get_product_review_stats(product_uuid uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  WITH stats AS (
    SELECT
      COUNT(*) as total_reviews,
      AVG(rating) as average_rating,
      COUNT(CASE WHEN is_verified_purchase THEN 1 END) as verified_purchases,
      COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1,
      COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
      COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
      COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
      COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5
    FROM public.reviews
    WHERE product_id = product_uuid AND status = 'approved'
  )
  SELECT json_build_object(
    'total_reviews', total_reviews,
    'average_rating', ROUND(average_rating::numeric, 1),
    'verified_purchases', verified_purchases,
    'rating_distribution', json_build_object(
      '1', rating_1,
      '2', rating_2,
      '3', rating_3,
      '4', rating_4,
      '5', rating_5
    )
  ) INTO result
  FROM stats;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur peut laisser un avis
CREATE OR REPLACE FUNCTION public.can_user_review(user_uuid uuid, product_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Vérifier si l'utilisateur a déjà laissé un avis
  IF EXISTS (
    SELECT 1 FROM public.reviews 
    WHERE user_id = user_uuid AND product_id = product_uuid
  ) THEN
    RETURN false;
  END IF;
  
  -- Vérifier si l'utilisateur a acheté le produit
  IF EXISTS (
    SELECT 1 FROM public.commandes c
    WHERE c.user_id = user_uuid 
      AND c.statut = 'payee'
      AND c.produits @> jsonb_build_array(jsonb_build_object('product_id', product_uuid::text))
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les anciens signalements résolus (rétention 6 mois)
CREATE OR REPLACE FUNCTION public.cleanup_old_review_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM public.review_reports 
  WHERE status IN ('resolved', 'dismissed')
    AND resolved_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS trigger_update_reviews_updated_at ON public.reviews;
CREATE TRIGGER trigger_update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_review_votes_updated_at ON public.review_votes;
CREATE TRIGGER trigger_update_review_votes_updated_at
  BEFORE UPDATE ON public.review_votes
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Vue pour faciliter l'affichage des avis avec les informations utilisateur
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

-- Commentaires pour la documentation
COMMENT ON TABLE public.reviews IS 'Avis clients sur les produits avec système de modération';
COMMENT ON TABLE public.review_votes IS 'Votes utiles/pas utiles sur les avis';
COMMENT ON TABLE public.review_reports IS 'Signalements d''avis inappropriés';
COMMENT ON COLUMN public.reviews.status IS 'Statut de modération: pending (en attente), approved (approuvé), rejected (rejeté)';
COMMENT ON COLUMN public.reviews.is_verified_purchase IS 'Indique si l''avis provient d''un achat vérifié';
COMMENT ON FUNCTION public.get_product_review_stats(uuid) IS 'Calcule les statistiques d''avis pour un produit (moyenne, distribution, etc.)';
COMMENT ON FUNCTION public.can_user_review(uuid, uuid) IS 'Vérifie si un utilisateur peut laisser un avis pour un produit'; 