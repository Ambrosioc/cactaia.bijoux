import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Vérifier l'authentification admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Vérifier le rôle admin
        const { data: profile } = await supabase
            .from('users')
            .select('role, active_role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.active_role !== 'admin') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }

        // Récupérer les paramètres de requête
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30d';

        // Calculer la date de début selon la période
        const now = new Date();
        let startDate = new Date();
        
        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'all':
                startDate = new Date(0); // 1er janvier 1970
                break;
        }

        // Récupérer les statistiques de base
        const { data: orders, error: ordersError } = await supabase
            .from('commandes')
            .select(`
                id,
                montant_total,
                statut,
                created_at,
                stripe_payment_intent_id
            `)
            .gte('created_at', startDate.toISOString())
            .not('stripe_payment_intent_id', 'is', null);

        if (ordersError) {
            console.error('Erreur Supabase:', ordersError);
            return NextResponse.json({ error: 'Erreur lors de la récupération des commandes' }, { status: 500 });
        }

        // Calculer les statistiques
        const totalPayments = orders?.length || 0;
        const totalAmount = orders?.reduce((sum, order) => sum + (order.montant_total || 0), 0) || 0;
        
        const statusCounts = {
            succeeded: 0,
            pending: 0,
            failed: 0,
            canceled: 0
        };

        orders?.forEach(order => {
            // Mapper les statuts de commande vers les statuts de paiement
            switch (order.statut) {
                case 'payee':
                    statusCounts.succeeded++;
                    break;
                case 'en_attente':
                    statusCounts.pending++;
                    break;
                case 'echouee':
                    statusCounts.failed++;
                    break;
                case 'annulee':
                    statusCounts.canceled++;
                    break;
                default:
                    statusCounts.pending++;
            }
        });

        const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

        // Statistiques par jour (pour les graphiques)
        const dailyStats = {};
        orders?.forEach(order => {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { count: 0, amount: 0 };
            }
            dailyStats[date].count++;
            dailyStats[date].amount += order.montant_total || 0;
        });

        // Convertir en tableau pour le frontend
        const dailyStatsArray = Object.entries(dailyStats).map(([date, stats]: [string, any]) => ({
            date,
            count: stats.count,
            amount: stats.amount
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return NextResponse.json({
            stats: {
                total_payments: totalPayments,
                total_amount: totalAmount,
                successful_payments: statusCounts.succeeded,
                failed_payments: statusCounts.failed,
                pending_payments: statusCounts.pending,
                canceled_payments: statusCounts.canceled,
                average_amount: averageAmount
            },
            daily_stats: dailyStatsArray,
            period: period
        });

    } catch (error) {
        console.error('Erreur API payment stats:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}
