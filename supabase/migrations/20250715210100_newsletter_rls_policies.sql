-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'inscription publique (INSERT)
CREATE POLICY "public_can_subscribe_newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Politique pour permettre la lecture publique des abonnés actifs (pour la désinscription)
CREATE POLICY "public_can_read_own_subscription"
ON public.newsletter_subscribers
FOR SELECT
TO anon, authenticated
USING (true);

-- Politique pour permettre la mise à jour publique (désinscription)
CREATE POLICY "public_can_update_own_subscription"
ON public.newsletter_subscribers
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Politique pour que les admins puissent voir tous les abonnés
CREATE POLICY "admin_can_view_newsletter_subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Politique pour que les admins puissent gérer tous les abonnés
CREATE POLICY "admin_can_manage_newsletter_subscribers"
ON public.newsletter_subscribers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
); 