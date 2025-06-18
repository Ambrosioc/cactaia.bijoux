/*
  # Création de la table commandes pour le système e-commerce

  1. Nouvelle Table
    - `commandes`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, clé étrangère vers auth.users)
      - `numero_commande` (text, unique - format CMD-YYYYMMDD-xxxx)
      - `produits` (jsonb, détails des produits commandés)
      - `montant_total` (numeric, montant total TTC)
      - `statut` (text, statut de la commande)
      - `stripe_session_id` (text, ID de session Stripe)
      - `stripe_payment_intent_id` (text, ID du payment intent Stripe)
      - `adresse_livraison` (jsonb, adresse de livraison)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur la table `commandes`
    - Politique pour que les utilisateurs ne puissent voir que leurs propres commandes

  3. Fonctions
    - Fonction pour générer automatiquement un numéro de commande unique
*/

-- Création de la table commandes
CREATE TABLE IF NOT EXISTS public.commandes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_commande text UNIQUE NOT NULL,
  produits jsonb NOT NULL DEFAULT '[]',
  montant_total numeric NOT NULL CHECK (montant_total >= 0),
  statut text DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'payee', 'echouee', 'remboursee', 'annulee')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  adresse_livraison jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne puissent voir que leurs propres commandes
CREATE POLICY "user_can_view_own_orders"
ON public.commandes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Politique pour que les admins puissent voir toutes les commandes
CREATE POLICY "admin_can_view_all_orders"
ON public.commandes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_commandes_user_id ON public.commandes(user_id);
CREATE INDEX IF NOT EXISTS idx_commandes_numero ON public.commandes(numero_commande);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON public.commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_stripe_session ON public.commandes(stripe_session_id);

-- Fonction pour générer automatiquement un numéro de commande
CREATE OR REPLACE FUNCTION public.generate_numero_commande()
RETURNS text AS $$
DECLARE
  date_part text;
  random_part text;
  numero text;
  counter integer := 0;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  LOOP
    -- Générer une partie aléatoire
    random_part := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    numero := 'CMD-' || date_part || '-' || random_part;
    
    -- Vérifier l'unicité
    IF NOT EXISTS (SELECT 1 FROM public.commandes WHERE numero_commande = numero) THEN
      RETURN numero;
    END IF;
    
    counter := counter + 1;
    -- Éviter une boucle infinie
    IF counter > 100 THEN
      random_part := LPAD(EXTRACT(EPOCH FROM NOW())::bigint::text, 10, '0');
      numero := 'CMD-' || date_part || '-' || random_part;
      RETURN numero;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour générer automatiquement le numéro de commande
CREATE OR REPLACE FUNCTION public.set_numero_commande()
RETURNS trigger AS $$
BEGIN
  IF NEW.numero_commande IS NULL OR NEW.numero_commande = '' THEN
    NEW.numero_commande := public.generate_numero_commande();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_numero_commande_trigger ON public.commandes;
CREATE TRIGGER set_numero_commande_trigger
  BEFORE INSERT ON public.commandes
  FOR EACH ROW EXECUTE PROCEDURE public.set_numero_commande();

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_commandes_updated_at ON public.commandes;
CREATE TRIGGER update_commandes_updated_at
  BEFORE UPDATE ON public.commandes
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();