-- Ajout du champ slug à la table produits
ALTER TABLE public.produits
ADD COLUMN IF NOT EXISTS slug text;

-- Générer un slug à partir du nom (fonction simple, sans accents)
CREATE OR REPLACE FUNCTION public.generate_slug(input text)
RETURNS text AS $$
DECLARE
  slug text;
BEGIN
  -- Remplacer les caractères accentués, espaces, etc.
  slug := lower(input);
  slug := regexp_replace(slug, '[àáâãäå]', 'a', 'gi');
  slug := regexp_replace(slug, '[èéêë]', 'e', 'gi');
  slug := regexp_replace(slug, '[ìíîï]', 'i', 'gi');
  slug := regexp_replace(slug, '[òóôõö]', 'o', 'gi');
  slug := regexp_replace(slug, '[ùúûü]', 'u', 'gi');
  slug := regexp_replace(slug, '[ç]', 'c', 'gi');
  slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'gi');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := regexp_replace(slug, '^-|-$', '', 'g');
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Remplir les slugs pour les produits existants
UPDATE public.produits SET slug = public.generate_slug(nom) WHERE slug IS NULL OR slug = '';

-- Ajouter une contrainte d'unicité et un index
CREATE UNIQUE INDEX IF NOT EXISTS idx_produits_slug_unique ON public.produits(slug);

-- Trigger pour générer le slug automatiquement à l'insertion ou modification du nom
CREATE OR REPLACE FUNCTION public.set_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR NEW.slug != public.generate_slug(NEW.nom) THEN
    NEW.slug := public.generate_slug(NEW.nom);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_slug_trigger ON public.produits;
CREATE TRIGGER set_slug_trigger
  BEFORE INSERT OR UPDATE OF nom ON public.produits
  FOR EACH ROW EXECUTE PROCEDURE public.set_slug();

-- Commentaire pour la documentation
COMMENT ON COLUMN public.produits.slug IS 'Identifiant unique SEO-friendly pour chaque produit, généré automatiquement à partir du nom.'; 