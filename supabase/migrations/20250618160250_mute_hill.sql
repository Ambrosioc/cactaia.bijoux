/*
  # Création du système de gestion des produits

  1. Nouvelle Table
    - `produits`
      - `id` (uuid, clé primaire)
      - `nom` (text, nom du produit)
      - `description` (text, description complète)
      - `description_courte` (text, description courte pour listes)
      - `prix` (numeric, prix principal)
      - `prix_promo` (numeric, prix promotionnel optionnel)
      - `categorie` (text, catégorie du produit)
      - `variations` (jsonb, tailles/couleurs/options)
      - `stock` (integer, quantité en stock)
      - `sku` (text, référence produit unique)
      - `images` (text[], URLs des images)
      - `est_actif` (boolean, produit visible/masqué)
      - `est_mis_en_avant` (boolean, produit featured)
      - `poids_grammes` (numeric, poids pour livraison)
      - `tva_applicable` (boolean, soumis à TVA)
      - `created_at` et `updated_at` (timestamps)

  2. Sécurité
    - Enable RLS sur la table `produits`
    - Seuls les admins peuvent gérer les produits
    - Lecture publique pour les produits actifs

  3. Storage
    - Bucket `produits` pour les images
    - Politiques d'accès appropriées
*/

-- Création de la table produits
CREATE TABLE IF NOT EXISTS public.produits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  description text,
  description_courte text,
  prix numeric NOT NULL CHECK (prix >= 0),
  prix_promo numeric CHECK (prix_promo >= 0 AND (prix_promo IS NULL OR prix_promo < prix)),
  categorie text NOT NULL,
  variations jsonb DEFAULT '{}',
  stock integer DEFAULT 0 CHECK (stock >= 0),
  sku text UNIQUE,
  images text[] DEFAULT '{}',
  est_actif boolean DEFAULT true,
  est_mis_en_avant boolean DEFAULT false,
  poids_grammes numeric CHECK (poids_grammes >= 0),
  tva_applicable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;

-- Politique pour que tout le monde puisse voir les produits actifs
CREATE POLICY "public_can_view_active_products"
ON public.produits
FOR SELECT
TO anon, authenticated
USING (est_actif = true);

-- Politique pour que les admins puissent tout gérer
CREATE POLICY "admin_can_manage_products"
ON public.produits
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_produits_categorie ON public.produits(categorie);
CREATE INDEX IF NOT EXISTS idx_produits_actif ON public.produits(est_actif);
CREATE INDEX IF NOT EXISTS idx_produits_mis_en_avant ON public.produits(est_mis_en_avant);
CREATE INDEX IF NOT EXISTS idx_produits_sku ON public.produits(sku);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_produits_updated_at ON public.produits;
CREATE TRIGGER update_produits_updated_at
  BEFORE UPDATE ON public.produits
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Fonction pour générer automatiquement un SKU si non fourni
CREATE OR REPLACE FUNCTION public.generate_sku()
RETURNS trigger AS $$
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku = 'PROD-' || UPPER(SUBSTRING(NEW.nom FROM 1 FOR 3)) || '-' || 
              TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || 
              LPAD(EXTRACT(EPOCH FROM NEW.created_at)::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer le SKU
DROP TRIGGER IF EXISTS generate_sku_trigger ON public.produits;
CREATE TRIGGER generate_sku_trigger
  BEFORE INSERT ON public.produits
  FOR EACH ROW EXECUTE PROCEDURE public.generate_sku();

-- Création du bucket de stockage pour les images (à exécuter via l'interface Supabase ou code)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('produits', 'produits', true);

-- Politique de stockage pour les images de produits
-- CREATE POLICY "admin_can_upload_product_images"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'produits' AND
--   EXISTS (
--     SELECT 1 FROM public.users
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- );

-- CREATE POLICY "admin_can_update_product_images"
-- ON storage.objects
-- FOR UPDATE
-- TO authenticated
-- USING (
--   bucket_id = 'produits' AND
--   EXISTS (
--     SELECT 1 FROM public.users
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- );

-- CREATE POLICY "admin_can_delete_product_images"
-- ON storage.objects
-- FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'produits' AND
--   EXISTS (
--     SELECT 1 FROM public.users
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- );

-- CREATE POLICY "public_can_view_product_images"
-- ON storage.objects
-- FOR SELECT
-- TO anon, authenticated
-- USING (bucket_id = 'produits');