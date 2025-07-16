-- Ajouter la colonne slug à la table produits
ALTER TABLE public.produits ADD COLUMN IF NOT EXISTS slug text;

-- Créer un index unique sur slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_produits_slug ON public.produits(slug);

-- Générer des slugs pour les produits existants basés sur leur nom
UPDATE public.produits 
SET slug = LOWER(REGEXP_REPLACE(nom, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Ajouter une contrainte NOT NULL après avoir rempli les valeurs
ALTER TABLE public.produits ALTER COLUMN slug SET NOT NULL;

-- Commentaire pour la documentation
COMMENT ON COLUMN public.produits.slug IS 'Slug unique pour l''URL du produit';
