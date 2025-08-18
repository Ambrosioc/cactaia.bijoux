import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        const db: any = supabase;
        const { searchParams } = new URL(request.url);

        // Vérifier l'authentification admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '20');
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Construire la requête
        let query = db
            .from('notifications')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        // Filtrer par type
        const type = searchParams.get('type');
        if (type) query = query.eq('type', type);

        // Filtrer non lues
        const unreadOnly = searchParams.get('unreadOnly') === 'true';
        if (unreadOnly) query = query.eq('read', false);

        // Récupérer les notifications paginées
        const { data, error } = await query.range(from, to);

        if (error) {
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des notifications' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            notifications: data || [],
            page,
            pageSize,
        });

    } catch (error) {
        console.error('❌ Erreur API notifications GET:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        const db: any = supabase;

        // Vérifier l'authentification admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { type, title, message, metadata } = await request.json();

        if (!type || !title || !message) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
        }

        // Créer la notification
        const { data: notification, error: createError } = await db
            .from('notifications')
            .insert({
                type,
                title,
                message,
                metadata: metadata || null,
                read: false
            })
            .select()
            .single();

        if (createError) {
            return NextResponse.json(
                { error: 'Erreur lors de la création de la notification' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, notification });

    } catch (error) {
        console.error('❌ Erreur API notifications POST:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}
