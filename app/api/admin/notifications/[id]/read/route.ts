import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
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

        const notificationId = params.id;

        if (!notificationId) {
            return NextResponse.json(
                { error: 'ID de notification requis' },
                { status: 400 }
            );
        }

        console.log('🔔 Marquage de la notification comme lue:', notificationId);

        // Marquer la notification comme lue
        const { data: notification, error: updateError } = await db
            .from('notifications')
            .update({ 
                read: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', notificationId)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Erreur lors de la mise à jour:', updateError);
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour de la notification' },
                { status: 500 }
            );
        }

        if (!notification) {
            return NextResponse.json(
                { error: 'Notification non trouvée' },
                { status: 404 }
            );
        }

        console.log('✅ Notification marquée comme lue:', notificationId);

        return NextResponse.json({
            success: true,
            notification: {
                ...notification,
                timestamp: new Date(notification.created_at),
                read: Boolean(notification.read)
            }
        });

    } catch (error) {
        console.error('❌ Erreur API notification read POST:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors du marquage de la notification',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
