/*
  Ensure get_collections_with_counts works reliably under RLS by using SECURITY DEFINER
  and granting execute to anon/authenticated. Still filters est_actif = true.
*/

CREATE OR REPLACE FUNCTION public.get_collections_with_counts()
RETURNS TABLE(collection text, product_count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT col AS collection, COUNT(*)::int AS product_count
  FROM public.produits p
  CROSS JOIN LATERAL unnest(p.collections) AS col
  WHERE p.est_actif = true
  GROUP BY col
  HAVING COUNT(*) > 0
  ORDER BY col;
$$;

GRANT EXECUTE ON FUNCTION public.get_collections_with_counts() TO anon, authenticated;


