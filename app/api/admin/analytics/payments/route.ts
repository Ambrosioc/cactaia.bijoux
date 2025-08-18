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

        console.log('📊 Récupération des analytics de paiements pour la période:', period);

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
                    totalRevenue: 0,
                    totalOrders: 0,
                    averageOrderValue: 0,
                    paymentMethods: {},
                    dailyTrends: [],
                    statusDistribution: {},
                    topProducts: [],
                    conversionRate: 0,
                    lastUpdated: new Date().toISOString()
                }
            });
        }

        // Calculer les métriques
        const totalRevenue = orders.reduce((sum, order) => sum + (order.montant_total || 0), 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalRevenue / totalOrders;
        
        // Distribution des méthodes de paiement (simulation pour l'instant)
        const paymentMethods = {
            'Carte bancaire': Math.floor(totalOrders * 0.75),
            'PayPal': Math.floor(totalOrders * 0.15),
            'Apple Pay': Math.floor(totalOrders * 0.08),
            'Google Pay': Math.floor(totalOrders * 0.02)
        };

        // Distribution des statuts
        const statusDistribution = orders.reduce((acc, order) => {
            const status = order.statut || 'inconnu';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Tendances quotidiennes
        const dailyTrends = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= now) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayOrders = orders.filter(order => 
                order.created_at?.startsWith(dateStr)
            );
            
            dailyTrends.push({
                date: dateStr,
                orders: dayOrders.length,
                revenue: dayOrders.reduce((sum, order) => sum + (order.montant_total || 0), 0),
                averageOrderValue: dayOrders.length > 0 
                    ? dayOrders.reduce((sum, order) => sum + (order.montant_total || 0), 0) / dayOrders.length 
                    : 0
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Top produits (simulation basée sur les commandes)
        const topProducts = [
            { name: 'Bague Cactaïa', sales: Math.floor(totalOrders * 0.3), revenue: totalRevenue * 0.3 },
            { name: 'Collier Élégance', sales: Math.floor(totalOrders * 0.25), revenue: totalRevenue * 0.25 },
            { name: 'Bracelet Zen', sales: Math.floor(totalOrders * 0.2), revenue: totalRevenue * 0.2 },
            { name: 'Pendentif Nature', sales: Math.floor(totalOrders * 0.15), revenue: totalRevenue * 0.15 },
            { name: 'Boucles d\'oreilles', sales: Math.floor(totalOrders * 0.1), revenue: totalRevenue * 0.1 }
        ];

        // Taux de conversion (simulation)
        const conversionRate = Math.random() * 3 + 2; // Entre 2% et 5%

        console.log(`✅ Analytics de paiements récupérés: ${totalOrders} commandes, ${totalRevenue}€ de CA`);

        return NextResponse.json({
            success: true,
            data: {
                period,
                totalRevenue,
                totalOrders,
                averageOrderValue,
                paymentMethods,
                dailyTrends,
                statusDistribution,
                topProducts,
                conversionRate,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erreur API analytics/payments:', error);
        return NextResponse.json(
            { 
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
