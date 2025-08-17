import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        
        // Vérifier l'authentification admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Vérifier le rôle admin
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role, active_role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.active_role !== 'admin') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }

        console.log('📁 Récupération des collections...');

        // Récupérer les collections avec le nombre de produits
        const { data: collections, error: collectionsError } = await supabase
            .from('collections')
            .select(`
                *,
                product_collections!inner(
                    product_id
                )
            `)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (collectionsError) {
            console.error('❌ Erreur lors de la récupération des collections:', collectionsError);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des collections' },
                { status: 500 }
            );
        }

        // Formater les collections avec le nombre de produits
        const formattedCollections = collections?.map(collection => ({
            ...collection,
            product_count: collection.product_collections?.length || 0
        })) || [];

        console.log(`✅ ${formattedCollections.length} collections récupérées`);

        return NextResponse.json({
            success: true,
            collections: formattedCollections
        });

    } catch (error) {
        console.error('❌ Erreur API collections GET:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la récupération des collections',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        
        // Vérifier l'authentification admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Vérifier le rôle admin
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role, active_role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.active_role !== 'admin') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }

        const { 
            name, 
            slug, 
            description, 
            image_url, 
            banner_url, 
            is_active, 
            is_featured, 
            sort_order,
            meta_title,
            meta_description
        } = await request.json();

        // Validation des données
        if (!name || !slug) {
            return NextResponse.json(
                { error: 'name et slug sont requis' },
                { status: 400 }
            );
        }

        console.log('📁 Création d\'une nouvelle collection:', { name, slug });

        // Créer la collection
        const { data: collection, error: createError } = await supabase
            .from('collections')
            .insert({
                name,
                slug,
                description: description || null,
                image_url: image_url || null,
                banner_url: banner_url || null,
                is_active: is_active !== undefined ? is_active : true,
                is_featured: is_featured !== undefined ? is_featured : false,
                sort_order: sort_order || 0,
                meta_title: meta_title || null,
                meta_description: meta_description || null
            })
            .select()
            .single();

        if (createError) {
            console.error('❌ Erreur lors de la création de la collection:', createError);
            return NextResponse.json(
                { error: 'Erreur lors de la création de la collection' },
                { status: 500 }
            );
        }

        console.log('✅ Collection créée avec succès:', collection.id);

        return NextResponse.json({
            success: true,
            collection
        });

    } catch (error) {
        console.error('❌ Erreur API collections POST:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la création de la collection',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
