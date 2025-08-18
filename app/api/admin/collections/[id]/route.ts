import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    ctx: any
) {
    const { params } = ctx ?? { params: {} } as any;
    try {
        const supabase = await createServerClient();
        const db: any = supabase;
        
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

        const collectionId = params.id;

        console.log('📁 Récupération de la collection:', collectionId);

        // Récupérer la collection
        const { data: collection, error: collectionError } = await db
            .from('collections')
            .select('*')
            .eq('id', collectionId)
            .single();

        if (collectionError) {
            console.error('❌ Erreur lors de la récupération de la collection:', collectionError);
            return NextResponse.json(
                { error: 'Collection non trouvée' },
                { status: 404 }
            );
        }

        console.log('✅ Collection récupérée:', collection.id);

        return NextResponse.json({
            success: true,
            collection
        });

    } catch (error) {
        console.error('❌ Erreur API collection GET:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la récupération de la collection',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    ctx: any
) {
    const { params } = ctx ?? { params: {} } as any;
    try {
        const supabase = await createServerClient();
        const db: any = supabase;
        
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

        const collectionId = params.id;
        const updateData = await request.json();

        console.log('📁 Mise à jour de la collection:', collectionId);

        // Mettre à jour la collection
        const { data: collection, error: updateError } = await db
            .from('collections')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', collectionId)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Erreur lors de la mise à jour:', updateError);
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour de la collection' },
                { status: 500 }
            );
        }

        console.log('✅ Collection mise à jour:', collection.id);

        return NextResponse.json({
            success: true,
            collection
        });

    } catch (error) {
        console.error('❌ Erreur API collection PUT:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la mise à jour de la collection',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    ctx: any
) {
    const { params } = ctx ?? { params: {} } as any;
    try {
        const supabase = await createServerClient();
        const db: any = supabase;
        
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

        const collectionId = params.id;
        const patchData = await request.json();

        console.log('📁 Mise à jour partielle de la collection:', collectionId);

        // Mettre à jour partiellement la collection
        const { data: collection, error: updateError } = await db
            .from('collections')
            .update({
                ...patchData,
                updated_at: new Date().toISOString()
            })
            .eq('id', collectionId)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Erreur lors de la mise à jour partielle:', updateError);
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour de la collection' },
                { status: 500 }
            );
        }

        console.log('✅ Collection mise à jour partiellement:', collection.id);

        return NextResponse.json({
            success: true,
            collection
        });

    } catch (error) {
        console.error('❌ Erreur API collection PATCH:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la mise à jour de la collection',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    ctx: any
) {
    const { params } = ctx ?? { params: {} } as any;
    try {
        const supabase = await createServerClient();
        const db: any = supabase;
        
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

        const collectionId = params.id;

        console.log('🗑️ Suppression de la collection:', collectionId);

        // Supprimer la collection
        const { error: deleteError } = await db
            .from('collections')
            .delete()
            .eq('id', collectionId);

        if (deleteError) {
            console.error('❌ Erreur lors de la suppression:', deleteError);
            return NextResponse.json(
                { error: 'Erreur lors de la suppression de la collection' },
                { status: 500 }
            );
        }

        console.log('✅ Collection supprimée:', collectionId);

        return NextResponse.json({
            success: true,
            message: 'Collection supprimée avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur API collection DELETE:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la suppression de la collection',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
