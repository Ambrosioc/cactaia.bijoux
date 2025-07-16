/*
  # Système de Wishlist

  1. Nouvelle Table
    - `wishlist_items`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, clé étrangère vers auth.users)
      - `product_id` (uuid, clé étrangère vers produits)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur la table `wishlist_items`
    - Politique pour que les utilisateurs ne puissent gérer que leurs propres items
    - Contrainte unique pour éviter les doublons

  3. Fonctionnalités
    - Ajout/suppression d'items
    - Vérification d'existence
    - Récupération de la wishlist complète
*/

-- Création de la table wishlist_items
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne puissent gérer que leurs propres items
CREATE POLICY "user_can_manage_own_wishlist"
ON public.wishlist_items
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON public.wishlist_items(created_at);

-- Fonction pour vérifier si un produit est dans la wishlist
CREATE OR REPLACE FUNCTION public.is_product_in_wishlist(product_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.wishlist_items
    WHERE user_id = auth.uid() AND product_id = product_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter un produit à la wishlist
CREATE OR REPLACE FUNCTION public.add_to_wishlist(product_uuid uuid)
RETURNS uuid AS $$
DECLARE
  wishlist_item_id uuid;
BEGIN
  INSERT INTO public.wishlist_items (user_id, product_id)
  VALUES (auth.uid(), product_uuid)
  ON CONFLICT (user_id, product_id) DO NOTHING
  RETURNING id INTO wishlist_item_id;
  
  RETURN wishlist_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour supprimer un produit de la wishlist
CREATE OR REPLACE FUNCTION public.remove_from_wishlist(product_uuid uuid)
RETURNS boolean AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.wishlist_items
  WHERE user_id = auth.uid() AND product_id = product_uuid;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour faciliter l'affichage de la wishlist avec les détails des produits
CREATE OR REPLACE VIEW public.wishlist_with_products AS
SELECT 
  wi.id as wishlist_item_id,
  wi.user_id,
  wi.product_id,
  wi.created_at as added_at,
  p.nom as product_name,
  p.description_courte as product_description,
  p.prix as product_price,
  p.prix_promo as product_promo_price,
  p.categorie as product_category,
  p.images as product_images,
  p.id as product_slug,
  p.stock as product_stock,
  p.est_actif as product_active
FROM public.wishlist_items wi
JOIN public.produits p ON wi.product_id = p.id
WHERE p.est_actif = true;

-- Commentaires pour la documentation
COMMENT ON TABLE public.wishlist_items IS 'Table des items de wishlist des utilisateurs';
COMMENT ON FUNCTION public.is_product_in_wishlist(uuid) IS 'Vérifie si un produit est dans la wishlist de l''utilisateur connecté';
COMMENT ON FUNCTION public.add_to_wishlist(uuid) IS 'Ajoute un produit à la wishlist de l''utilisateur connecté';
COMMENT ON FUNCTION public.remove_from_wishlist(uuid) IS 'Supprime un produit de la wishlist de l''utilisateur connecté';
COMMENT ON VIEW public.wishlist_with_products IS 'Vue pour afficher la wishlist avec les détails complets des produits'; 