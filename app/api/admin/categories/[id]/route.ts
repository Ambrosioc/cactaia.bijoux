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

        const { data: category, error } = await db
            .from('categories')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Catégorie non trouvée' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            category
        });

    } catch (error) {
        console.error('❌ Erreur API categories GET [id]:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération de la catégorie' },
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

        const updateData = await request.json();

        const { data: category, error } = await db
            .from('categories')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            category
        });

    } catch (error) {
        console.error('❌ Erreur API categories PUT [id]:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour de la catégorie' },
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

        const updateData = await request.json();

        const { data: category, error } = await db
            .from('categories')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            category
        });

    } catch (error) {
        console.error('❌ Erreur API categories PATCH [id]:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour de la catégorie' },
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

        const { error } = await db
            .from('categories')
            .delete()
            .eq('id', params.id);

        if (error) {
            return NextResponse.json(
                { error: 'Erreur lors de la suppression' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Catégorie supprimée avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur API categories DELETE [id]:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression de la catégorie' },
            { status: 500 }
        );
    }
}
