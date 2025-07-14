-- Migration pour ajouter la colonne profile_completed à la table users
-- Cette colonne permet de savoir si un utilisateur a complété son profil après l'inscription

-- Ajouter la colonne profile_completed
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Mettre à jour les utilisateurs existants pour marquer leur profil comme complété
-- (on suppose que les utilisateurs existants ont déjà un profil complet)
UPDATE public.users 
SET profile_completed = true 
WHERE profile_completed IS NULL OR profile_completed = false;

-- Ajouter un commentaire sur la colonne
COMMENT ON COLUMN public.users.profile_completed IS 'Indique si l''utilisateur a complété son profil après l''inscription initiale';

-- Mettre à jour les politiques RLS pour inclure la nouvelle colonne
-- (les politiques existantes devraient déjà fonctionner avec la nouvelle colonne) 