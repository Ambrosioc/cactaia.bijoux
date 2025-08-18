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

        console.log('📊 Calcul des statistiques pour la période:', period);

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

        // Récupérer les commandes pour la période
        const { data: orders, error: ordersError } = await supabase
            .from('commandes')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', now.toISOString());

        if (ordersError) {
            console.error('❌ Erreur Supabase:', ordersError);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des statistiques' },
                { status: 500 }
            );
        }

        console.log(`✅ ${orders?.length || 0} commandes récupérées pour les statistiques`);

        // Si aucune commande trouvée, retourner des statistiques vides
        if (!orders || orders.length === 0) {
            return NextResponse.json({
                success: true,
                stats: {
                    total_payments: 0,
                    total_amount: 0,
                    successful_payments: 0,
                    failed_payments: 0,
                    average_amount: 0
                },
                dailyStats: []
            });
        }

        // Calculer les statistiques
        const totalPayments = orders.length;
        const totalAmount = orders.reduce((sum, order) => sum + (order.montant_total || 0), 0);
        const successfulPayments = orders.filter(order => order.statut === 'payee').length;
        const failedPayments = orders.filter(order => order.statut === 'echouee').length;
        const averageAmount = totalAmount / totalPayments;

        // Calculer les statistiques quotidiennes
        const dailyStatsMap = new Map<string, { count: number; amount: number }>();
        
        orders.forEach(order => {
            const createdAt = order.created_at ?? new Date().toISOString();
            const date = new Date(createdAt as unknown as string).toISOString().split('T')[0];
            const existing = dailyStatsMap.get(date) || { count: 0, amount: 0 };
            dailyStatsMap.set(date, {
                count: existing.count + 1,
                amount: existing.amount + (order.montant_total || 0)
            });
        });

        const dailyStats = Array.from(dailyStatsMap.entries())
            .map(([date, stats]) => ({
                date,
                count: stats.count,
                amount: stats.amount
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const stats = {
            total_payments: totalPayments,
            total_amount: totalAmount,
            successful_payments: successfulPayments,
            failed_payments: failedPayments,
            average_amount: averageAmount
        };

        console.log('✅ Statistiques calculées:', stats);

        return NextResponse.json({
            success: true,
            stats,
            dailyStats
        });

    } catch (error) {
        console.error('❌ Erreur API payments stats GET:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors du calcul des statistiques',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
