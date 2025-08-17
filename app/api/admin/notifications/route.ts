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

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const type = searchParams.get('type') || undefined;
        const unread_only = searchParams.get('unread_only') || undefined;
        const period = searchParams.get('period') || undefined;
        const search = searchParams.get('search') || undefined;

        console.log('🔔 Récupération des notifications...', { page, limit, type, unread_only, period });

        // Calculer l'offset pour la pagination
        const offset = (page - 1) * limit;

        // Construire la requête
        let query = supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Filtrer par type si spécifié
        if (type && type !== 'all') {
            query = query.eq('type', type);
        }

        // Filtrer par statut de lecture si demandé
        if (unread_only === 'true') {
            query = query.eq('read', false);
        } else if (unread_only === 'false') {
            query = query.eq('read', true);
        }

        // Filtrer par période si spécifiée
        if (period && period !== 'all') {
            const now = new Date();
            let startDate: Date;
            
            switch (period) {
                case '1d':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0); // Depuis le début
            }
            
            query = query.gte('created_at', startDate.toISOString());
        }

        // Recherche textuelle si spécifiée
        if (search) {
            query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
        }

        const { data: notifications, error: notificationsError, count } = await query;

        if (notificationsError) {
            console.error('❌ Erreur lors de la récupération des notifications:', notificationsError);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des notifications' },
                { status: 500 }
            );
        }

        // Récupérer les statistiques
        const stats = {
            total: count || 0,
            unread: 0,
            by_type: { success: 0, warning: 0, error: 0, info: 0 }
        };

        // Compter par type et non lues
        notifications?.forEach(notif => {
            if (notif.type in stats.by_type) {
                stats.by_type[notif.type as keyof typeof stats.by_type]++;
            }
            if (!notif.read) {
                stats.unread++;
            }
        });

        console.log(`✅ ${notifications?.length || 0} notifications récupérées (page ${page})`);

        // Formater les notifications pour le frontend
        const formattedNotifications = (notifications || []).map(notif => ({
            ...notif,
            created_at: notif.created_at,
            read: Boolean(notif.read)
        }));

        return NextResponse.json({
            success: true,
            notifications: formattedNotifications,
            stats,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error) {
        console.error('❌ Erreur API notifications GET:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la récupération des notifications',
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

        const { type, title, message, metadata, action_url } = await request.json();

        // Validation des données
        if (!type || !title || !message) {
            return NextResponse.json(
                { error: 'type, title et message sont requis' },
                { status: 400 }
            );
        }

        // Valider le type de notification
        const validTypes = ['success', 'warning', 'error', 'info'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Type de notification invalide' },
                { status: 400 }
            );
        }

        console.log('🔔 Création d\'une nouvelle notification:', { type, title });

        // Créer la notification
        const { data: notification, error: createError } = await supabase
            .from('notifications')
            .insert({
                type,
                title,
                message,
                metadata: metadata || {},
                action_url: action_url || null,
                created_by: user.id,
                read: false
            })
            .select()
            .single();

        if (createError) {
            console.error('❌ Erreur lors de la création de la notification:', createError);
            return NextResponse.json(
                { error: 'Erreur lors de la création de la notification' },
                { status: 500 }
            );
        }

        console.log('✅ Notification créée avec succès:', notification.id);

        return NextResponse.json({
            success: true,
            notification: {
                ...notification,
                timestamp: new Date(notification.created_at),
                read: Boolean(notification.read)
            }
        });

    } catch (error) {
        console.error('❌ Erreur API notifications POST:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la création de la notification',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
