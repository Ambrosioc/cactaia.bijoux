import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

        console.log('🔔 Marquage de toutes les notifications comme lues...');

        // Marquer toutes les notifications non lues comme lues
        const { data: notifications, error: updateError } = await supabase
            .from('notifications')
            .update({ 
                read: true,
                updated_at: new Date().toISOString()
            })
            .eq('read', false)
            .select();

        if (updateError) {
            console.error('❌ Erreur lors de la mise à jour:', updateError);
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour des notifications' },
                { status: 500 }
            );
        }

        const updatedCount = notifications?.length || 0;
        console.log(`✅ ${updatedCount} notifications marquées comme lues`);

        return NextResponse.json({
            success: true,
            message: `${updatedCount} notifications marquées comme lues`,
            updated_count: updatedCount
        });

    } catch (error) {
        console.error('❌ Erreur API notifications mark-all-read POST:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors du marquage des notifications',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
