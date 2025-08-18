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

        console.log('📁 Récupération des catégories...');

        // Récupérer les catégories avec le nombre de produits
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select(`
                *,
                product_categories(
                    product_id
                )
            `)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (categoriesError) {
            console.error('❌ Erreur lors de la récupération des catégories:', categoriesError);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des catégories' },
                { status: 500 }
            );
        }

        // Formater les catégories avec le nombre de produits
        const formattedCategories = categories?.map(category => ({
            ...category,
            product_count: category.product_categories?.length || 0
        })) || [];

        console.log(`✅ ${formattedCategories.length} catégories récupérées`);

        return NextResponse.json({
            success: true,
            categories: formattedCategories
        });

    } catch (error) {
        console.error('❌ Erreur API categories GET:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la récupération des catégories',
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
            is_active, 
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

        console.log('📁 Création d\'une nouvelle catégorie:', { name, slug });

        // Créer la catégorie
        const { data: category, error: createError } = await supabase
            .from('categories')
            .insert({
                name,
                slug,
                description: description || null,
                is_active: is_active !== undefined ? is_active : true,
                sort_order: sort_order || 0,
                meta_title: meta_title || null,
                meta_description: meta_description || null
            })
            .select()
            .single();

        if (createError) {
            console.error('❌ Erreur lors de la création de la catégorie:', createError);
            return NextResponse.json(
                { error: 'Erreur lors de la création de la catégorie' },
                { status: 500 }
            );
        }

        console.log('✅ Catégorie créée avec succès:', category.id);

        return NextResponse.json({
            success: true,
            category
        });

    } catch (error) {
        console.error('❌ Erreur API categories POST:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la création de la catégorie',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
