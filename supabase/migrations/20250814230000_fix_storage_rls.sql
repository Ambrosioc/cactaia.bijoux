/*
  # Migration pour corriger les politiques RLS du Storage Supabase
  
  Cette migration corrige les problèmes d'upload d'images dans le bucket produits.
*/

-- 1. Vérifier que le bucket 'produits' existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'produits'
    ) THEN
        -- Créer le bucket 'produits' s'il n'existe pas
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'produits',
            'produits',
            true,
            52428800, -- 50MB
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
        );
        RAISE NOTICE 'Bucket "produits" créé avec succès';
    ELSE
        RAISE NOTICE 'Bucket "produits" existe déjà';
    END IF;
END $$;

-- 2. Supprimer toutes les politiques existantes sur le bucket 'produits'
DROP POLICY IF EXISTS "produits_public_read" ON storage.objects;
DROP POLICY IF EXISTS "produits_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "produits_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "produits_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "produits_admin_manage" ON storage.objects;

-- 3. Créer les politiques RLS pour le bucket 'produits'

-- Politique pour permettre la lecture publique des images
CREATE POLICY "produits_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'produits');

-- Politique pour permettre aux utilisateurs authentifiés d'insérer des images
CREATE POLICY "produits_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'produits' AND
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'user')
);

-- Politique pour permettre aux admins de modifier les images
CREATE POLICY "produits_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'produits' AND
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
)
WITH CHECK (
    bucket_id = 'produits' AND
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Politique pour permettre aux admins de supprimer les images
CREATE POLICY "produits_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'produits' AND
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- 4. Vérifier que RLS est activé sur storage.objects (sans ALTER TABLE)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS est déjà activé sur storage.objects';
    ELSE
        RAISE NOTICE '⚠️ RLS n''est pas activé sur storage.objects (nécessite des permissions spéciales)';
    END IF;
END $$;

-- 5. Créer des politiques similaires pour d'autres buckets si nécessaire
-- Bucket pour les avatars utilisateurs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'avatars'
    ) THEN
        -- Politiques pour le bucket avatars
        DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
        DROP POLICY IF EXISTS "avatars_authenticated_insert" ON storage.objects;
        DROP POLICY IF EXISTS "avatars_authenticated_update" ON storage.objects;
        DROP POLICY IF EXISTS "avatars_authenticated_delete" ON storage.objects;
        
        CREATE POLICY "avatars_public_read"
        ON storage.objects FOR SELECT
        TO anon, authenticated
        USING (bucket_id = 'avatars');
        
        CREATE POLICY "avatars_authenticated_insert"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'avatars');
        
        CREATE POLICY "avatars_authenticated_update"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'avatars')
        WITH CHECK (bucket_id = 'avatars');
        
        CREATE POLICY "avatars_authenticated_delete"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'avatars');
        
        RAISE NOTICE 'Politiques RLS créées pour le bucket "avatars"';
    END IF;
END $$;

-- 6. Vérifier que toutes les politiques sont en place
DO $$
DECLARE
    policy_count integer;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage';
    
    RAISE NOTICE 'Nombre de politiques RLS sur storage.objects: %', policy_count;
    
    IF policy_count >= 4 THEN
        RAISE NOTICE '✅ Toutes les politiques RLS sont en place pour le Storage';
    ELSE
        RAISE NOTICE '❌ Il manque des politiques RLS sur le Storage';
    END IF;
END $$;
