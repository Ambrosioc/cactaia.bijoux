/*
  RPC to list collections with number of active products in each.
  Only returns collections associated to at least one active product.
*/

CREATE OR REPLACE FUNCTION public.get_collections_with_counts()
RETURNS TABLE(collection text, product_count integer) AS $$
  SELECT col AS collection, COUNT(*)::int AS product_count
  FROM public.produits p
  CROSS JOIN LATERAL unnest(p.collections) AS col
  WHERE p.est_actif = true
  GROUP BY col
  HAVING COUNT(*) > 0
  ORDER BY col;
$$ LANGUAGE sql STABLE;


