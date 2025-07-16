-- Création de la table newsletter_subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  civilite text NOT NULL CHECK (civilite IN ('Madame', 'Monsieur')),
  prenom text NOT NULL,
  nom text NOT NULL,
  date_naissance date NOT NULL,
  email text UNIQUE NOT NULL,
  code_reduction text UNIQUE,
  est_actif boolean DEFAULT true,
  date_inscription timestamptz DEFAULT now(),
  date_desinscription timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_actif ON public.newsletter_subscribers(est_actif);
CREATE INDEX IF NOT EXISTS idx_newsletter_date_inscription ON public.newsletter_subscribers(date_inscription);
CREATE INDEX IF NOT EXISTS idx_newsletter_code_reduction ON public.newsletter_subscribers(code_reduction); 