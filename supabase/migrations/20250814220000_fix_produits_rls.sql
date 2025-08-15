/*
  # Migration pour corriger les politiques RLS et triggers sur la table produits
  
  Cette migration corrige les problèmes d'upload d'images et de gestion des produits.
*/

-- 1. Vérifier et corriger la structure de la table produits
-- Ajouter le champ updated_at s'il n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'produits' AND column_name = 'updated_at') THEN
        ALTER TABLE public.produits ADD COLUMN updated_at timestamptz DEFAULT now();
        RAISE NOTICE 'Champ updated_at ajouté à la table produits';
    ELSE
        RAISE NOTICE 'Le champ updated_at existe déjà dans la table produits';
    END IF;
END $$;

-- 2. S'assurer que la fonction update_updated_at_column existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recréer les triggers pour la table produits
DROP TRIGGER IF EXISTS update_produits_updated_at ON public.produits;
CREATE TRIGGER update_produits_updated_at
  BEFORE UPDATE ON public.produits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Vérifier que RLS est activé sur la table produits
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;

-- 5. Supprimer toutes les politiques existantes sur la table produits
DROP POLICY IF EXISTS "produits_public_read" ON public.produits;
DROP POLICY IF EXISTS "produits_admin_write" ON public.produits;
DROP POLICY IF EXISTS "produits_admin_read" ON public.produits;
DROP POLICY IF EXISTS "produits_admin_delete" ON public.produits;
DROP POLICY IF EXISTS "produits_admin_insert" ON public.produits;
DROP POLICY IF EXISTS "produits_admin_update" ON public.produits;

-- 6. Recréer les politiques RLS pour la table produits
-- Politique pour permettre la lecture publique des produits actifs
CREATE POLICY "produits_public_read"
ON public.produits FOR SELECT
TO anon, authenticated
USING (est_actif = true);

-- Politique pour permettre aux admins de lire tous les produits
CREATE POLICY "produits_admin_read"
ON public.produits FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Politique pour permettre aux admins d'insérer de nouveaux produits
CREATE POLICY "produits_admin_insert"
ON public.produits FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Politique pour permettre aux admins de modifier les produits
CREATE POLICY "produits_admin_update"
ON public.produits FOR UPDATE
TO authenticated
USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Politique pour permettre aux admins de supprimer les produits
CREATE POLICY "produits_admin_delete"
ON public.produits FOR DELETE
TO authenticated
USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- 7. Vérifier et corriger les triggers manquants
-- Trigger pour générer automatiquement le SKU
CREATE OR REPLACE FUNCTION public.generate_sku()
RETURNS trigger AS $$
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := 'SKU-' || substr(md5(random()::text), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_sku_trigger ON public.produits;
CREATE TRIGGER generate_sku_trigger
  BEFORE INSERT ON public.produits
  FOR EACH ROW EXECUTE FUNCTION public.generate_sku();

-- 8. Commentaires pour la documentation
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Fonction pour mettre à jour automatiquement le champ updated_at';
COMMENT ON TRIGGER update_produits_updated_at ON public.produits IS 'Trigger pour mettre à jour automatiquement updated_at lors des modifications';
COMMENT ON FUNCTION public.generate_sku() IS 'Fonction pour générer automatiquement un SKU unique';
COMMENT ON TRIGGER generate_sku_trigger ON public.produits IS 'Trigger pour générer automatiquement un SKU lors de l''insertion';

-- 9. Vérifier que toutes les politiques sont en place
DO $$
DECLARE
    policy_count integer;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'produits' 
    AND schemaname = 'public';
    
    RAISE NOTICE 'Nombre de politiques RLS sur la table produits: %', policy_count;
    
    IF policy_count >= 5 THEN
        RAISE NOTICE '✅ Toutes les politiques RLS sont en place pour la table produits';
    ELSE
        RAISE NOTICE '❌ Il manque des politiques RLS sur la table produits';
    END IF;
END $$;
