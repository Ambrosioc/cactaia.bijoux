/*
  # Système d'Analytics et Reporting

  1. Nouvelle Table
    - `analytics_events`
      - `id` (uuid, clé primaire)
      - `event_type` (text, type d'événement)
      - `user_id` (uuid, clé étrangère vers auth.users)
      - `session_id` (text, ID de session)
      - `page_url` (text, URL de la page)
      - `product_id` (uuid, clé étrangère vers produits)
      - `product_name` (text, nom du produit)
      - `product_price` (numeric, prix du produit)
      - `search_term` (text, terme de recherche)
      - `order_id` (uuid, clé étrangère vers commandes)
      - `order_total` (numeric, montant de la commande)
      - `metadata` (jsonb, données supplémentaires)
      - `created_at` (timestamp)

  2. Index pour optimiser les requêtes
  3. Politiques RLS appropriées
  4. Fonctions pour les rapports
*/

-- Création de la table analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'add_to_cart', 'purchase', 'search', 'user_signup', 'user_login')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  page_url text,
  product_id uuid REFERENCES public.produits(id) ON DELETE SET NULL,
  product_name text,
  product_price numeric CHECK (product_price >= 0),
  search_term text,
  order_id uuid REFERENCES public.commandes(id) ON DELETE SET NULL,
  order_total numeric CHECK (order_total >= 0),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Politique pour que les admins puissent voir tous les événements
CREATE POLICY "admin_can_view_all_analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Politique pour que les utilisateurs puissent voir leurs propres événements
CREATE POLICY "user_can_view_own_analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Politique pour permettre l'insertion d'événements
CREATE POLICY "allow_analytics_insert"
ON public.analytics_events
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id ON public.analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_order_id ON public.analytics_events(order_id);

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON public.analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created ON public.analytics_events(user_id, created_at);

-- Fonction pour nettoyer les anciens événements (rétention 90 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics_events()
RETURNS void AS $$
BEGIN
  DELETE FROM public.analytics_events 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les métriques du dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(days_back integer DEFAULT 30)
RETURNS json AS $$
DECLARE
  result json;
  start_date timestamptz;
BEGIN
  start_date := NOW() - (days_back || ' days')::interval;
  
  WITH metrics AS (
    SELECT
      -- Commandes
      COUNT(DISTINCT c.id) as total_orders,
      COALESCE(SUM(c.montant_total), 0) as total_revenue,
      CASE 
        WHEN COUNT(DISTINCT c.id) > 0 
        THEN COALESCE(SUM(c.montant_total), 0) / COUNT(DISTINCT c.id)
        ELSE 0 
      END as average_order_value,
      
      -- Utilisateurs
      COUNT(DISTINCT u.id) as total_users,
      COUNT(DISTINCT CASE WHEN u.created_at >= date_trunc('day', NOW()) THEN u.id END) as new_users_today,
      
      -- Vues de pages
      COUNT(DISTINCT CASE WHEN ae.event_type = 'page_view' THEN ae.id END) as total_page_views,
      
      -- Produits les plus vus
      json_agg(
        DISTINCT jsonb_build_object(
          'product_id', ae.product_id,
          'product_name', ae.product_name,
          'views', COUNT(CASE WHEN ae.event_type = 'product_view' THEN 1 END)
        )
      ) FILTER (WHERE ae.product_id IS NOT NULL) as top_products
      
    FROM public.commandes c
    FULL OUTER JOIN public.users u ON u.created_at >= start_date
    FULL OUTER JOIN public.analytics_events ae ON ae.created_at >= start_date
    WHERE (c.created_at >= start_date OR c.created_at IS NULL)
      AND (u.created_at >= start_date OR u.created_at IS NULL)
      AND (ae.created_at >= start_date OR ae.created_at IS NULL)
      AND (c.statut = 'payee' OR c.statut IS NULL)
  )
  SELECT json_build_object(
    'total_orders', total_orders,
    'total_revenue', total_revenue,
    'average_order_value', average_order_value,
    'conversion_rate', CASE 
      WHEN total_page_views > 0 
      THEN (total_orders::float / total_page_views::float) * 100
      ELSE 0 
    END,
    'user_metrics', json_build_object(
      'total_users', total_users,
      'new_users_today', new_users_today,
      'active_users_today', 0
    ),
    'top_products', COALESCE(top_products, '[]'::json)
  ) INTO result
  FROM metrics;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les ventes quotidiennes
CREATE OR REPLACE FUNCTION public.get_daily_sales(days_back integer DEFAULT 30)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'date', date_series.date,
      'orders', COALESCE(daily_stats.orders, 0),
      'revenue', COALESCE(daily_stats.revenue, 0)
    )
    ORDER BY date_series.date
  ) INTO result
  FROM (
    SELECT generate_series(
      date_trunc('day', NOW() - (days_back || ' days')::interval),
      date_trunc('day', NOW()),
      '1 day'::interval
    )::date as date
  ) date_series
  LEFT JOIN (
    SELECT 
      date_trunc('day', created_at)::date as date,
      COUNT(*) as orders,
      SUM(montant_total) as revenue
    FROM public.commandes
    WHERE created_at >= NOW() - (days_back || ' days')::interval
      AND statut = 'payee'
    GROUP BY date_trunc('day', created_at)::date
  ) daily_stats ON date_series.date = daily_stats.date;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un trigger pour nettoyer automatiquement les anciens événements
CREATE OR REPLACE FUNCTION public.trigger_cleanup_analytics()
RETURNS trigger AS $$
BEGIN
  -- Nettoyer les événements de plus de 90 jours une fois par jour
  IF (SELECT COUNT(*) FROM public.analytics_events WHERE created_at < NOW() - INTERVAL '90 days') > 1000 THEN
    PERFORM public.cleanup_old_analytics_events();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour le nettoyage automatique
DROP TRIGGER IF EXISTS trigger_cleanup_analytics_events ON public.analytics_events;
CREATE TRIGGER trigger_cleanup_analytics_events
  AFTER INSERT ON public.analytics_events
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_cleanup_analytics();

-- Commentaires pour la documentation
COMMENT ON TABLE public.analytics_events IS 'Table pour stocker les événements analytics du site e-commerce';
COMMENT ON COLUMN public.analytics_events.event_type IS 'Type d''événement: page_view, product_view, add_to_cart, purchase, search, user_signup, user_login';
COMMENT ON COLUMN public.analytics_events.session_id IS 'ID de session unique pour tracker les parcours utilisateur';
COMMENT ON COLUMN public.analytics_events.metadata IS 'Données supplémentaires au format JSON pour chaque événement'; 