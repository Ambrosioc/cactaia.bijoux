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
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        const status = searchParams.get('status') || undefined;

        console.log('🔄 Récupération des commandes...');

        // Construire la requête
        let query = supabase
            .from('commandes')
            .select(`
                id,
                user_id,
                montant_total,
                statut,
                created_at,
                updated_at,
                users!inner(
                    email,
                    nom,
                    prenom
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        // Appliquer le filtre de statut si spécifié
        if (status && status !== 'all') {
            query = query.eq('statut', status);
        }

        const { data: orders, error: ordersError } = await query;

        if (ordersError) {
            console.error('❌ Erreur Supabase:', ordersError);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des commandes' },
                { status: 500 }
            );
        }

        console.log(`✅ ${orders?.length || 0} commandes récupérées`);

        // Formater les données pour le frontend
        const formattedOrders = (orders || []).map(order => ({
            id: order.id,
            user_id: order.user_id,
            montant_total: order.montant_total,
            statut: order.statut,
            created_at: order.created_at,
            updated_at: order.updated_at,
            user: order.users ? {
                email: order.users.email,
                nom: order.users.nom,
                prenom: order.users.prenom
            } : undefined
        }));

        return NextResponse.json({
            success: true,
            orders: formattedOrders,
            total: formattedOrders.length
        });

    } catch (error) {
        console.error('❌ Erreur API orders GET:', error);
        return NextResponse.json(
            { 
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
