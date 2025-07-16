/*
  # Ajout du champ collections à la table produits

  1. Modifications
    - Ajout du champ `collections` (text[], tableau de collections)
    - Index pour optimiser les requêtes par collection
    - Fonction pour récupérer les collections uniques
*/

-- Ajouter le champ collections
ALTER TABLE public.produits 
ADD COLUMN IF NOT EXISTS collections text[] DEFAULT '{}';

-- Index pour optimiser les requêtes par collection
CREATE INDEX IF NOT EXISTS idx_produits_collections ON public.produits USING GIN(collections);

-- Fonction pour récupérer toutes les collections uniques
CREATE OR REPLACE FUNCTION public.get_unique_collections()
RETURNS text[] AS $$
DECLARE
  result text[];
BEGIN
  SELECT ARRAY(
    SELECT DISTINCT unnest(collections)
    FROM public.produits
    WHERE est_actif = true
    AND collections IS NOT NULL
    AND array_length(collections, 1) > 0
    ORDER BY unnest(collections)
  ) INTO result;
  
  RETURN COALESCE(result, '{}'::text[]);
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour récupérer les produits par collection
CREATE OR REPLACE FUNCTION public.get_products_by_collection(collection_name text)
RETURNS SETOF public.produits AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.produits p
  WHERE p.est_actif = true
  AND p.collections @> ARRAY[collection_name];
END;
$$ LANGUAGE plpgsql STABLE;

-- Commentaires pour la documentation
COMMENT ON COLUMN public.produits.collections IS 'Tableau des collections auxquelles appartient le produit (ex: ["Été 2025", "Nouveautés"])';
COMMENT ON FUNCTION public.get_unique_collections() IS 'Récupère toutes les collections uniques des produits actifs';
COMMENT ON FUNCTION public.get_products_by_collection(text) IS 'Récupère tous les produits d''une collection spécifique'; 