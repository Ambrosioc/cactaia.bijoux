/*
  # Création du système d'authentification utilisateurs

  1. Nouvelles Tables
    - `users`
      - `id` (uuid, clé primaire liée à auth.users)
      - `email` (text, obligatoire)
      - `nom` (text, obligatoire)
      - `prenom` (text, obligatoire)
      - `telephone` (text, facultatif)
      - `adresse` (text, facultatif)
      - `role` (text, rôle principal - 'user' ou 'admin')
      - `active_role` (text, rôle actif - permet aux admins de switcher)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur la table `users`
    - Politique pour que les utilisateurs puissent lire/modifier leurs propres données
    - Politique pour que les admins puissent gérer tous les utilisateurs

  3. Triggers
    - Trigger automatique pour créer une entrée users lors de l'inscription
*/

-- Création de la table users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nom text NOT NULL DEFAULT '',
  prenom text NOT NULL DEFAULT '',
  telephone text,
  adresse text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  active_role text DEFAULT 'user' CHECK (active_role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir et modifier leurs propres données
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Politique pour que les admins puissent voir tous les utilisateurs
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politique pour que les admins puissent modifier tous les utilisateurs
CREATE POLICY "Admins can update all users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fonction pour créer automatiquement un profil utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, nom, prenom, role, active_role)
  VALUES (new.id, new.email, '', '', 'user', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après l'insertion d'un nouvel utilisateur dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fonction pour permettre aux admins de changer leur rôle actif
CREATE OR REPLACE FUNCTION public.switch_active_role(new_active_role text)
RETURNS void AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent changer de rôle actif';
  END IF;

  -- Vérifier que le nouveau rôle est valide
  IF new_active_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Rôle actif invalide';
  END IF;

  -- Mettre à jour le rôle actif
  UPDATE public.users
  SET active_role = new_active_role
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;