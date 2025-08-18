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
        const period = searchParams.get('period') || '30d';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '25', 10);
        const status = searchParams.get('status') || null;
        const search = searchParams.get('search') || null;

        console.log('🔍 Paramètres de recherche:', { status, period, search, page, limit });

        // Calculer la date de début basée sur la période
        const now = new Date();
        let startDate: Date;
        
        switch (period) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(0); // Depuis le début
        }

        console.log('📊 Exécution de la requête Supabase...');

        // Construire la requête de base
        let query = supabase
            .from('commandes')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', now.toISOString())
            .order('created_at', { ascending: false });

        // Appliquer le filtre de statut si spécifié
        if (status && status !== 'all') {
            query = query.eq('statut', status);
        }

        // Appliquer la recherche si spécifiée
        if (search) {
            query = query.or(`id.ilike.%${search}%,user_id.ilike.%${search}%`);
        }

        // Récupérer le total pour la pagination
        const { count, error: countError } = await supabase
            .from('commandes')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate.toISOString())
            .lte('created_at', now.toISOString());

        if (countError) {
            console.error('❌ Erreur lors du comptage:', countError);
        }

        // Appliquer la pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

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
        const formattedPayments = (orders || []).map(order => {
            // Simuler des données Stripe pour les tests
            const stripePaymentIntentId = order.id.startsWith('pi_') 
                ? order.id 
                : `pi_test_${order.id.slice(-8)}_${Date.now()}`;

            return {
                id: order.id,
                order_id: order.id,
                order_number: `CMD-${order.id.slice(-6)}`,
                customer_id: order.user_id,
                customer_email: `user-${order.user_id.slice(-6)}@example.com`, // Simulé
                customer_name: `Utilisateur ${order.user_id.slice(-6)}`, // Simulé
                amount: order.montant_total * 100, // Convertir en centimes
                currency: 'eur',
                status: order.statut === 'payee' ? 'succeeded' : 
                       order.statut === 'en_attente' ? 'pending' : 
                       order.statut === 'echouee' ? 'failed' : 
                       order.statut === 'annulee' ? 'canceled' : 'unknown',
                payment_method: 'card',
                stripe_payment_intent_id: stripePaymentIntentId,
                created_at: order.created_at,
                updated_at: order.updated_at,
                metadata: {
                    order_id: order.id,
                    user_id: order.user_id
                }
            };
        });

        return NextResponse.json({
            success: true,
            payments: formattedPayments,
            pagination: {
                page,
                limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error) {
        console.error('❌ Erreur API payments GET:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la récupération des commandes',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
