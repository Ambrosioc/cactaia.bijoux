import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

        const notificationId = params.id;

        if (!notificationId) {
            return NextResponse.json(
                { error: 'ID de notification requis' },
                { status: 400 }
            );
        }

        console.log('🗑️ Suppression de la notification:', notificationId);

        // Supprimer la notification
        const { error: deleteError } = await db
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (deleteError) {
            console.error('❌ Erreur lors de la suppression:', deleteError);
            return NextResponse.json(
                { error: 'Erreur lors de la suppression de la notification' },
                { status: 500 }
            );
        }

        console.log('✅ Notification supprimée:', notificationId);

        return NextResponse.json({
            success: true,
            message: 'Notification supprimée avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur API notification DELETE:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la suppression de la notification',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
