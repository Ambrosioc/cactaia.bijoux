/*
  # Ajout des champs pour le formulaire d'inscription complet

  1. Modifications de la table users
    - Ajout du champ `genre` (Homme, Femme, Autre)
    - Ajout du champ `date_naissance` (date de naissance)
    - Ajout du champ `newsletter` (opt-in marketing)
    - Ajout du champ `cgv_accepted` (acceptation des CGV)

  2. Mise à jour de la fonction handle_new_user
    - Prise en compte des nouveaux champs lors de l'inscription
*/

-- Ajout des nouveaux champs à la table users
DO $$
BEGIN
  -- Ajouter le champ genre s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'genre'
  ) THEN
    ALTER TABLE public.users ADD COLUMN genre text CHECK (genre IN ('Homme', 'Femme', 'Autre'));
  END IF;

  -- Ajouter le champ date_naissance s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'date_naissance'
  ) THEN
    ALTER TABLE public.users ADD COLUMN date_naissance date;
  END IF;

  -- Ajouter le champ newsletter s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'newsletter'
  ) THEN
    ALTER TABLE public.users ADD COLUMN newsletter boolean DEFAULT false;
  END IF;

  -- Ajouter le champ cgv_accepted s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'cgv_accepted'
  ) THEN
    ALTER TABLE public.users ADD COLUMN cgv_accepted boolean DEFAULT false;
  END IF;

  -- Ajouter le champ cgv_accepted_at s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'cgv_accepted_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN cgv_accepted_at timestamptz;
  END IF;
END $$;