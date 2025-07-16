-- Migration pour supprimer les champs telephone et adresse de la table users
-- Ces champs ne sont plus nécessaires car les adresses sont gérées dans la table addresses

-- Supprimer la colonne telephone
ALTER TABLE public.users DROP COLUMN IF EXISTS telephone;

-- Supprimer la colonne adresse
ALTER TABLE public.users DROP COLUMN IF EXISTS adresse;

-- Commentaire pour la documentation
COMMENT ON TABLE public.users IS 'Table des utilisateurs sans les champs telephone et adresse (gérés séparément)'; 