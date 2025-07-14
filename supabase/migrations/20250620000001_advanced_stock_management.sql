/*
  # Système de Gestion des Stocks Avancé

  1. Nouvelles Tables
    - `stock_movements` : Historique des mouvements de stock
    - `stock_alerts` : Alertes de stock (faible, épuisé, surstock)
    - `stock_settings` : Paramètres de gestion des stocks

  2. Fonctionnalités
    - Suivi des mouvements de stock (entrée, sortie, ajustement, réservation)
    - Alertes automatiques (stock faible, épuisé, surstock)
    - Historique complet des mouvements
    - Gestion des réservations pour commandes
    - Seuils configurables par produit
*/

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'reserved', 'released')),
  quantity integer NOT NULL,
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  reason text NOT NULL,
  order_id uuid REFERENCES public.commandes(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Table des alertes de stock
CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstock')),
  threshold integer NOT NULL,
  current_stock integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Table des paramètres de stock (extension de la table produits)
ALTER TABLE public.produits 
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS overstock_threshold integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS stock_warning_enabled boolean DEFAULT true;

-- Enable RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

-- Politiques pour stock_movements
CREATE POLICY "admin_can_manage_stock_movements"
ON public.stock_movements
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Politiques pour stock_alerts
CREATE POLICY "admin_can_manage_stock_alerts"
ON public.stock_alerts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON public.stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order_id ON public.stock_movements(order_id);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON public.stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_type ON public.stock_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_active ON public.stock_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_created_at ON public.stock_alerts(created_at);

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created ON public.stock_movements(product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_active ON public.stock_alerts(product_id, is_active);

-- Fonction pour calculer le stock disponible (stock - réservations)
CREATE OR REPLACE FUNCTION public.get_available_stock(product_uuid uuid)
RETURNS integer AS $$
DECLARE
  current_stock integer;
  reserved_stock integer;
BEGIN
  -- Obtenir le stock actuel
  SELECT stock INTO current_stock
  FROM public.produits
  WHERE id = product_uuid;
  
  IF current_stock IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculer le stock réservé (commandes en attente)
  SELECT COALESCE(SUM(
    (jsonb_array_elements(produits)->>'quantite')::integer
  ), 0) INTO reserved_stock
  FROM public.commandes
  WHERE statut = 'en_attente'
    AND produits @> jsonb_build_array(jsonb_build_object('product_id', product_uuid::text));
  
  RETURN GREATEST(0, current_stock - reserved_stock);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un produit a suffisamment de stock
CREATE OR REPLACE FUNCTION public.check_stock_availability(product_uuid uuid, required_quantity integer)
RETURNS boolean AS $$
BEGIN
  RETURN public.get_available_stock(product_uuid) >= required_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le statut du stock d'un produit
CREATE OR REPLACE FUNCTION public.get_stock_status(product_uuid uuid)
RETURNS text AS $$
DECLARE
  available_stock integer;
  low_threshold integer;
  over_threshold integer;
BEGIN
  available_stock := public.get_available_stock(product_uuid);
  
  SELECT low_stock_threshold, overstock_threshold 
  INTO low_threshold, over_threshold
  FROM public.produits
  WHERE id = product_uuid;
  
  IF available_stock = 0 THEN
    RETURN 'out_of_stock';
  ELSIF available_stock <= low_threshold THEN
    RETURN 'low_stock';
  ELSIF available_stock > over_threshold THEN
    RETURN 'overstock';
  ELSE
    RETURN 'in_stock';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les anciens mouvements de stock (rétention 1 an)
CREATE OR REPLACE FUNCTION public.cleanup_old_stock_movements()
RETURNS void AS $$
BEGIN
  DELETE FROM public.stock_movements 
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciennes alertes résolues (rétention 6 mois)
CREATE OR REPLACE FUNCTION public.cleanup_old_stock_alerts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.stock_alerts 
  WHERE is_active = false 
    AND resolved_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement les alertes lors des changements de stock
CREATE OR REPLACE FUNCTION public.trigger_stock_alert_check()
RETURNS trigger AS $$
DECLARE
  available_stock integer;
  low_threshold integer;
  over_threshold integer;
  stock_status text;
BEGIN
  -- Calculer le stock disponible
  available_stock := public.get_available_stock(NEW.id);
  
  -- Obtenir les seuils
  low_threshold := NEW.low_stock_threshold;
  over_threshold := NEW.overstock_threshold;
  
  -- Déterminer le statut
  IF available_stock = 0 THEN
    stock_status := 'out_of_stock';
  ELSIF available_stock <= low_threshold THEN
    stock_status := 'low_stock';
  ELSIF available_stock > over_threshold THEN
    stock_status := 'overstock';
  ELSE
    stock_status := 'in_stock';
  END IF;
  
  -- Créer ou résoudre les alertes selon le statut
  IF stock_status = 'out_of_stock' THEN
    -- Créer une alerte de stock épuisé
    INSERT INTO public.stock_alerts (product_id, alert_type, threshold, current_stock, is_active)
    VALUES (NEW.id, 'out_of_stock', 0, available_stock, true)
    ON CONFLICT (product_id, alert_type) DO NOTHING;
  ELSIF stock_status = 'low_stock' THEN
    -- Créer une alerte de stock faible
    INSERT INTO public.stock_alerts (product_id, alert_type, threshold, current_stock, is_active)
    VALUES (NEW.id, 'low_stock', low_threshold, available_stock, true)
    ON CONFLICT (product_id, alert_type) DO NOTHING;
  ELSIF stock_status = 'overstock' THEN
    -- Créer une alerte de surstock
    INSERT INTO public.stock_alerts (product_id, alert_type, threshold, current_stock, is_active)
    VALUES (NEW.id, 'overstock', over_threshold, available_stock, true)
    ON CONFLICT (product_id, alert_type) DO NOTHING;
  ELSE
    -- Résoudre toutes les alertes actives
    UPDATE public.stock_alerts 
    SET is_active = false, resolved_at = NOW()
    WHERE product_id = NEW.id AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la vérification automatique des alertes
DROP TRIGGER IF EXISTS trigger_stock_alert_check ON public.produits;
CREATE TRIGGER trigger_stock_alert_check
  AFTER UPDATE OF stock ON public.produits
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_stock_alert_check();

-- Vue pour faciliter la gestion des stocks
CREATE OR REPLACE VIEW public.product_stock_overview AS
SELECT 
  p.id as product_id,
  p.nom as product_name,
  p.stock as current_stock,
  public.get_available_stock(p.id) as available_stock,
  public.get_stock_status(p.id) as stock_status,
  p.low_stock_threshold,
  p.overstock_threshold,
  p.stock_warning_enabled,
  COALESCE(
    (SELECT COUNT(*) FROM public.stock_alerts sa WHERE sa.product_id = p.id AND sa.is_active = true),
    0
  ) as active_alerts,
  p.updated_at as last_updated
FROM public.produits p
WHERE p.est_actif = true;

-- Commentaires pour la documentation
COMMENT ON TABLE public.stock_movements IS 'Historique des mouvements de stock (entrées, sorties, ajustements, réservations)';
COMMENT ON TABLE public.stock_alerts IS 'Alertes automatiques pour les problèmes de stock (faible, épuisé, surstock)';
COMMENT ON COLUMN public.stock_movements.movement_type IS 'Type de mouvement: in (entrée), out (sortie), adjustment (ajustement), reserved (réservé), released (libéré)';
COMMENT ON COLUMN public.stock_alerts.alert_type IS 'Type d''alerte: low_stock (stock faible), out_of_stock (épuisé), overstock (surstock)';
COMMENT ON FUNCTION public.get_available_stock(uuid) IS 'Calcule le stock disponible en soustrayant les réservations du stock actuel';
COMMENT ON FUNCTION public.check_stock_availability(uuid, integer) IS 'Vérifie si un produit a suffisamment de stock disponible';
COMMENT ON FUNCTION public.get_stock_status(uuid) IS 'Détermine le statut du stock d''un produit (in_stock, low_stock, out_of_stock, overstock)'; 