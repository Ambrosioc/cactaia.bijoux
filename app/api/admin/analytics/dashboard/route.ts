import { createAdminErrorResponse, verifyAdminAccess } from '@/lib/auth/admin-middleware';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'accès admin
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.success) {
      return createAdminErrorResponse(adminCheck.error || 'Erreur d\'accès', adminCheck.status || 500);
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Récupérer les paramètres de date
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y

    // Calculer les dates
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
        startDate.setDate(now.getDate() - 7);
    }

    // 1. Métriques générales
    const { data: totalEvents, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .gte('created_at', startDate.toISOString());

    const { data: pageViews, error: pageViewsError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .eq('event_type', 'page_view')
      .gte('created_at', startDate.toISOString());

    const { data: productViews, error: productViewsError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .eq('event_type', 'product_view')
      .gte('created_at', startDate.toISOString());

    const { data: addToCart, error: addToCartError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .eq('event_type', 'add_to_cart')
      .gte('created_at', startDate.toISOString());

    const { data: purchases, error: purchasesError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .eq('event_type', 'purchase')
      .gte('created_at', startDate.toISOString());

    // 2. Chiffre d'affaires total
    const { data: revenueData, error: revenueError } = await supabase
      .from('analytics_events')
      .select('order_total')
      .eq('event_type', 'purchase')
      .not('order_total', 'is', null)
      .gte('created_at', startDate.toISOString());

    const totalRevenue = revenueData?.reduce((sum, event) => sum + (event.order_total || 0), 0) || 0;

    // 3. Produits les plus vus
    const { data: topProducts, error: topProductsError } = await supabase
      .from('analytics_events')
      .select('product_name, count')
      .eq('event_type', 'product_view')
      .not('product_name', 'is', null)
      .gte('created_at', startDate.toISOString());

    // Grouper par produit
    const productViewsCount: Record<string, number> = {};
    topProducts?.forEach(event => {
      if (event.product_name) {
        productViewsCount[event.product_name] = (productViewsCount[event.product_name] || 0) + 1;
      }
    });

    const topProductsList = Object.entries(productViewsCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Pages les plus visitées
    const { data: topPages, error: topPagesError } = await supabase
      .from('analytics_events')
      .select('page_url, count')
      .eq('event_type', 'page_view')
      .gte('created_at', startDate.toISOString());

    const pageViewsByUrl: Record<string, number> = {};
    topPages?.forEach(event => {
      pageViewsByUrl[event.page_url] = (pageViewsByUrl[event.page_url] || 0) + 1;
    });

    const topPagesList = Object.entries(pageViewsByUrl)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 5. Évolution temporelle (derniers 7 jours)
    const dailyData: Array<{
      date: string;
      pageViews: number;
      productViews: number;
      addToCart: number;
      purchases: number;
    }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyData.push({
        date: dateStr,
        pageViews: 0,
        productViews: 0,
        addToCart: 0,
        purchases: 0
      });
    }

    // Récupérer les données par jour
    const { data: dailyEvents, error: dailyEventsError } = await supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Compter les événements par jour
    dailyEvents?.forEach(event => {
      const dateStr = new Date(event.created_at).toISOString().split('T')[0];
      const dayData = dailyData.find(d => d.date === dateStr);
      if (dayData) {
        switch (event.event_type) {
          case 'page_view':
            dayData.pageViews++;
            break;
          case 'product_view':
            dayData.productViews++;
            break;
          case 'add_to_cart':
            dayData.addToCart++;
            break;
          case 'purchase':
            dayData.purchases++;
            break;
        }
      }
    });

    // 6. Taux de conversion
    const totalPageViews = pageViews?.length || 0;
    const totalPurchases = purchases?.length || 0;
    const totalAddToCart = addToCart?.length || 0;
    
    const conversionRate = totalPageViews > 0 
      ? ((totalPurchases / totalPageViews) * 100).toFixed(2)
      : '0';

    const addToCartRate = totalPageViews > 0
      ? ((totalAddToCart / totalPageViews) * 100).toFixed(2)
      : '0';

    // Vérifier les erreurs
    if (eventsError || pageViewsError || productViewsError || addToCartError || purchasesError) {
      console.error('Erreur récupération métriques:', { eventsError, pageViewsError, productViewsError, addToCartError, purchasesError });
    }

    return NextResponse.json({
      period,
      metrics: {
        totalEvents: totalEvents?.length || 0,
        pageViews: totalPageViews,
        productViews: productViews?.length || 0,
        addToCart: totalAddToCart,
        purchases: totalPurchases,
        totalRevenue: totalRevenue.toFixed(2),
        conversionRate: parseFloat(conversionRate),
        addToCartRate: parseFloat(addToCartRate)
      },
      topProducts: topProductsList,
      topPages: topPagesList,
      dailyData,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API analytics dashboard:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 