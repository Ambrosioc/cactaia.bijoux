/*
  # Création de la table email_logs pour suivre les emails envoyés

  1. Nouvelle Table
    - `email_logs`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, clé étrangère vers auth.users)
      - `order_id` (uuid, clé étrangère vers commandes, optionnel)
      - `email_type` (text, type d'email: welcome, order_confirmation, invoice, etc.)
      - `recipient` (text, adresse email du destinataire)
      - `subject` (text, sujet de l'email)
      - `success` (boolean, si l'email a été envoyé avec succès)
      - `message_id` (text, ID du message retourné par Mailjet)
      - `error` (text, message d'erreur si échec)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur la table `email_logs`
    - Politique pour que les admins puissent voir tous les logs
    - Politique pour que les utilisateurs puissent voir leurs propres logs
*/

-- Création de la table email_logs
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.commandes(id) ON DELETE SET NULL,
  email_type text NOT NULL,
  recipient text NOT NULL,
  subject text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  message_id text,
  error text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour que les admins puissent voir tous les logs
CREATE POLICY "admin_can_view_all_email_logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Politique pour que les utilisateurs puissent voir leurs propres logs
CREATE POLICY "users_can_view_own_email_logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON public.email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_success ON public.email_logs(success);