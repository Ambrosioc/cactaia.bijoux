/*
  Fix SRF usage in functions to be compatible with modern PostgreSQL.
  - Rewrites public.get_available_stock to use LATERAL jsonb_array_elements
  - Rewrites public.get_unique_collections to use LATERAL unnest
*/

-- Rewrite get_available_stock to avoid SRF in aggregate arguments
CREATE OR REPLACE FUNCTION public.get_available_stock(product_uuid uuid)
RETURNS integer AS $$
DECLARE
  current_stock integer;
  reserved_stock integer;
BEGIN
  SELECT stock INTO current_stock
  FROM public.produits
  WHERE id = product_uuid;

  IF current_stock IS NULL THEN
    RETURN 0;
  END IF;

  -- Use LATERAL to expand produits JSON array before SUM
  SELECT COALESCE(SUM((elem->>'quantite')::integer), 0) INTO reserved_stock
  FROM public.commandes c
  CROSS JOIN LATERAL jsonb_array_elements(c.produits) AS elem
  WHERE c.statut = 'en_attente'
    AND (elem->>'product_id') = product_uuid::text;

  RETURN GREATEST(0, current_stock - reserved_stock);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rewrite get_unique_collections to avoid SRF in SELECT list
CREATE OR REPLACE FUNCTION public.get_unique_collections()
RETURNS text[] AS $$
DECLARE
  result text[];
BEGIN
  SELECT ARRAY(
    SELECT DISTINCT col
    FROM public.produits p
    CROSS JOIN LATERAL unnest(p.collections) AS col
    WHERE p.est_actif = true
    ORDER BY col
  ) INTO result;

  RETURN COALESCE(result, '{}'::text[]);
END;
$$ LANGUAGE plpgsql STABLE;


