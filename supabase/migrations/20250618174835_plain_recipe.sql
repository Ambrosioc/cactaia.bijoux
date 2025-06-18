/*
  # Ajout du champ facture_url à la table commandes

  1. Modifications
    - Ajout du champ `facture_url` pour stocker l'URL de la facture PDF Stripe
    - Ajout d'un index pour optimiser les requêtes
*/

-- Ajouter le champ facture_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commandes' AND column_name = 'facture_url'
  ) THEN
    ALTER TABLE public.commandes ADD COLUMN facture_url text;
  END IF;
END $$;

-- Index pour optimiser les requêtes sur les factures
CREATE INDEX IF NOT EXISTS idx_commandes_facture_url ON public.commandes(facture_url) WHERE facture_url IS NOT NULL;

-- Commentaire pour documenter le champ
COMMENT ON COLUMN public.commandes.facture_url IS 'URL de la facture PDF générée par Stripe';