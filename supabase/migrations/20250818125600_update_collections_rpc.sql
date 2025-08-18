/*
  Update get_collections_with_counts to:
  - treat NULL est_actif as active (COALESCE)
  - trim collection names to avoid hidden whitespace mismatches
  - ignore NULL collection entries
*/

CREATE OR REPLACE FUNCTION public.get_collections_with_counts()
RETURNS TABLE(collection text, product_count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT TRIM(col) AS collection, COUNT(*)::int AS product_count
  FROM public.produits p
  CROSS JOIN LATERAL unnest(p.collections) AS col
  WHERE COALESCE(p.est_actif, true) = true
    AND col IS NOT NULL
    AND TRIM(col) <> ''
  GROUP BY TRIM(col)
  HAVING COUNT(*) > 0
  ORDER BY TRIM(col);
$$;

GRANT EXECUTE ON FUNCTION public.get_collections_with_counts() TO anon, authenticated;


