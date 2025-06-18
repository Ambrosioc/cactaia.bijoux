/*
  # Création de la table addresses pour la gestion des adresses de livraison

  1. Nouvelle Table
    - `addresses`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, clé étrangère vers auth.users)
      - `nom_complet` (text, nom complet pour la livraison)
      - `ligne_1` (text, adresse principale)
      - `ligne_2` (text, complément d'adresse - facultatif)
      - `code_postal` (text, code postal)
      - `ville` (text, ville)
      - `pays` (text, pays - France par défaut)
      - `telephone` (text, numéro de téléphone)
      - `est_principale` (boolean, adresse par défaut)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur la table `addresses`
    - Politique pour que les utilisateurs ne puissent gérer que leurs propres adresses

  3. Contraintes
    - Un seul adresse principale par utilisateur
    - Trigger pour gérer automatiquement l'adresse principale
*/

-- Création de la table addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_complet text NOT NULL,
  ligne_1 text NOT NULL,
  ligne_2 text,
  code_postal text NOT NULL,
  ville text NOT NULL,
  pays text NOT NULL DEFAULT 'France',
  telephone text NOT NULL,
  est_principale boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne puissent gérer que leurs propres adresses
CREATE POLICY "user_can_manage_own_addresses"
ON public.addresses
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_principale ON public.addresses(user_id, est_principale) WHERE est_principale = true;

-- Fonction pour s'assurer qu'il n'y a qu'une seule adresse principale par utilisateur
CREATE OR REPLACE FUNCTION public.ensure_single_primary_address()
RETURNS trigger AS $$
BEGIN
  -- Si la nouvelle adresse est marquée comme principale
  IF NEW.est_principale = true THEN
    -- Désactiver toutes les autres adresses principales de cet utilisateur
    UPDATE public.addresses 
    SET est_principale = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  -- Si c'est la première adresse de l'utilisateur, la marquer comme principale
  IF NOT EXISTS (
    SELECT 1 FROM public.addresses 
    WHERE user_id = NEW.user_id AND id != NEW.id
  ) THEN
    NEW.est_principale = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour gérer l'adresse principale
DROP TRIGGER IF EXISTS ensure_single_primary_address_trigger ON public.addresses;
CREATE TRIGGER ensure_single_primary_address_trigger
  BEFORE INSERT OR UPDATE ON public.addresses
  FOR EACH ROW EXECUTE PROCEDURE public.ensure_single_primary_address();

-- Fonction pour s'assurer qu'il reste toujours une adresse principale
CREATE OR REPLACE FUNCTION public.ensure_primary_address_exists()
RETURNS trigger AS $$
BEGIN
  -- Si on supprime l'adresse principale et qu'il reste d'autres adresses
  IF OLD.est_principale = true THEN
    UPDATE public.addresses 
    SET est_principale = true 
    WHERE user_id = OLD.user_id 
      AND id != OLD.id 
      AND id = (
        SELECT id FROM public.addresses 
        WHERE user_id = OLD.user_id AND id != OLD.id 
        ORDER BY created_at ASC 
        LIMIT 1
      );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour gérer la suppression d'adresse principale
DROP TRIGGER IF EXISTS ensure_primary_address_exists_trigger ON public.addresses;
CREATE TRIGGER ensure_primary_address_exists_trigger
  BEFORE DELETE ON public.addresses
  FOR EACH ROW EXECUTE PROCEDURE public.ensure_primary_address_exists();