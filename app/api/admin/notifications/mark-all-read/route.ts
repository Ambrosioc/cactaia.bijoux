import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

        // Marquer toutes les notifications non lues comme lues
        const { data: notifications, error: updateError } = await db
            .from('notifications')
            .update({ 
                read: true,
                updated_at: new Date().toISOString()
            })
            .eq('read', false)
            .select();

        if (updateError) {
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour des notifications' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            updated_count: notifications?.length || 0
        });

    } catch (error) {
        console.error('❌ Erreur API notifications mark-all-read POST:', error);
        return NextResponse.json(
            { 
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
