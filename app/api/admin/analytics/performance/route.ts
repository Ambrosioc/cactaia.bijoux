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
            default:
                startDate.setDate(now.getDate() - 30);
        }

        console.log('📈 Récupération des rapports de performance pour la période:', period);

        // Récupérer les commandes de la période
        const { data: orders, error: ordersError } = await supabase
            .from('commandes')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', now.toISOString())
            .order('created_at', { ascending: true });

        if (ordersError) {
            console.error('Erreur lors de la récupération des commandes:', ordersError);
            return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 });
        }

        if (!orders || orders.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    period,
                    kpis: {},
                    trends: [],
                    comparisons: {},
                    insights: [],
                    lastUpdated: new Date().toISOString()
                }
            });
        }

        // Calculer les KPIs
        const totalRevenue = orders.reduce((sum, order) => sum + (order.montant_total || 0), 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalRevenue / totalOrders;
        const successfulOrders = orders.filter(order => order.statut === 'payee').length;
        const successRate = (successfulOrders / totalOrders) * 100;

        // Calculer les tendances par jour
        const dailyStats: Record<string, { orders: number; revenue: number; successRate: number }> = {};
        const currentDate = new Date(startDate);
        
        while (currentDate <= now) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayOrders = orders.filter(order => 
                order.created_at?.startsWith(dateStr)
            );
            
            if (dayOrders.length > 0) {
                const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.montant_total || 0), 0);
                const daySuccess = dayOrders.filter(order => order.statut === 'payee').length;
                
                dailyStats[dateStr] = {
                    orders: dayOrders.length,
                    revenue: dayRevenue,
                    successRate: (daySuccess / dayOrders.length) * 100
                };
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Convertir en tableau pour les graphiques
        const trends = Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            orders: stats.orders,
            revenue: stats.revenue,
            successRate: stats.successRate
        }));

        // Comparaisons avec la période précédente
        const previousStartDate = new Date(startDate);
        const previousEndDate = new Date(startDate);
        const currentPeriodDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        previousStartDate.setDate(previousStartDate.getDate() - currentPeriodDays);
        previousEndDate.setDate(previousEndDate.getDate() - currentPeriodDays);

        // Récupérer les données de la période précédente pour comparaison
        const { data: previousOrders } = await supabase
            .from('commandes')
            .select('*')
            .gte('created_at', previousStartDate.toISOString())
            .lte('created_at', previousEndDate.toISOString());

        let previousRevenue = 0;
        let previousOrdersCount = 0;
        let previousSuccessRate = 0;

        if (previousOrders && previousOrders.length > 0) {
            previousRevenue = previousOrders.reduce((sum, order) => sum + (order.montant_total || 0), 0);
            previousOrdersCount = previousOrders.length;
            const previousSuccess = previousOrders.filter(order => order.statut === 'payee').length;
            previousSuccessRate = (previousSuccess / previousOrdersCount) * 100;
        }

        // Calculer les variations
        const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        const ordersChange = previousOrdersCount > 0 ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100 : 0;
        const successRateChange = previousSuccessRate > 0 ? successRate - previousSuccessRate : 0;

        // Générer des insights
        const insights = [];
        
        if (revenueChange > 10) {
            insights.push({
                type: 'positive',
                title: 'Croissance du chiffre d\'affaires',
                description: `+${revenueChange.toFixed(1)}% par rapport à la période précédente`,
                icon: '📈'
            });
        } else if (revenueChange < -10) {
            insights.push({
                type: 'negative',
                title: 'Baisse du chiffre d\'affaires',
                description: `${revenueChange.toFixed(1)}% par rapport à la période précédente`,
                icon: '📉'
            });
        }

        if (successRate > 90) {
            insights.push({
                type: 'positive',
                title: 'Excellent taux de succès',
                description: `${successRate.toFixed(1)}% des commandes sont réussies`,
                icon: '✅'
            });
        } else if (successRate < 80) {
            insights.push({
                type: 'warning',
                title: 'Taux de succès à améliorer',
                description: `${successRate.toFixed(1)}% des commandes sont réussies`,
                icon: '⚠️'
            });
        }

        if (averageOrderValue > 100) {
            insights.push({
                type: 'positive',
                title: 'Panier moyen élevé',
                description: `${averageOrderValue.toFixed(2)}€ de panier moyen`,
                icon: '💰'
            });
        }

        console.log(`✅ Rapports de performance récupérés: ${totalOrders} commandes, ${totalRevenue}€ de CA, ${successRate.toFixed(1)}% de succès`);

        return NextResponse.json({
            success: true,
            data: {
                period,
                kpis: {
                    totalRevenue,
                    totalOrders,
                    averageOrderValue,
                    successRate,
                    revenueChange,
                    ordersChange,
                    successRateChange
                },
                trends,
                comparisons: {
                    previousPeriod: {
                        revenue: previousRevenue,
                        orders: previousOrdersCount,
                        successRate: previousSuccessRate
                    },
                    changes: {
                        revenue: revenueChange,
                        orders: ordersChange,
                        successRate: successRateChange
                    }
                },
                insights,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erreur API analytics/performance:', error);
        return NextResponse.json(
            { 
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
