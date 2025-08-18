/*
  Fix RLS for Supabase Storage bucket "produits" to allow authenticated uploads
  without relying on JWT user_metadata. Uses public.users.active_role instead.
*/

-- Ensure bucket exists (no-op if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'produits'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('produits', 'produits', true);
  END IF;
END $$;

-- Drop previous policies if they exist
DROP POLICY IF EXISTS "produits_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "produits_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "produits_admin_delete" ON storage.objects;
DROP POLICY IF EXISTS "produits_public_read" ON storage.objects;

-- Public read for the bucket
CREATE POLICY "produits_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'produits');

-- Allow any authenticated user to upload into the bucket
CREATE POLICY "produits_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'produits' AND
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
  )
);

-- Only admins (per public.users.active_role) can update existing objects
CREATE POLICY "produits_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'produits' AND
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.active_role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'produits' AND
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.active_role = 'admin'
  )
);

-- Only admins can delete objects
CREATE POLICY "produits_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'produits' AND
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.active_role = 'admin'
  )
);


