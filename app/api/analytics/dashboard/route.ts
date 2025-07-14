import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    // Récupérer les métriques de base
    const { data: totalEvents, error: totalError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (totalError) {
      console.error('Erreur lors de la récupération du total des événements:', totalError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des métriques' },
        { status: 500 }
      );
    }

    // Récupérer les événements par type
    const { data: eventsByType, error: typeError } = await supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (typeError) {
      console.error('Erreur lors de la récupération des événements par type:', typeError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des métriques' },
        { status: 500 }
      );
    }

    // Récupérer les pages les plus visitées
    const { data: topPages, error: pagesError } = await supabase
      .from('analytics_events')
      .select('page_url, created_at')
      .eq('event_type', 'page_view')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (pagesError) {
      console.error('Erreur lors de la récupération des pages populaires:', pagesError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des métriques' },
        { status: 500 }
      );
    }

    // Récupérer les utilisateurs uniques
    const { data: uniqueUsers, error: usersError } = await supabase
      .from('analytics_events')
      .select('user_id, created_at')
      .not('user_id', 'is', null)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (usersError) {
      console.error('Erreur lors de la récupération des utilisateurs uniques:', usersError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des métriques' },
        { status: 500 }
      );
    }

    // Traitement des données
    const eventTypeCounts = eventsByType?.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const pageCounts = topPages?.reduce((acc, event) => {
      acc[event.page_url] = (acc[event.page_url] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const uniqueUserIds = new Set(uniqueUsers?.map(event => event.user_id).filter(Boolean));
    const uniqueUserCount = uniqueUserIds.size;

    // Données pour les graphiques
    const dailyData = eventsByType?.reduce((acc, event) => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const chartData = Object.entries(dailyData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topPagesList = Object.entries(pageCounts)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const response = {
      metrics: {
        totalEvents: totalEvents?.length || 0,
        uniqueUsers: uniqueUserCount,
        pageViews: eventTypeCounts['page_view'] || 0,
        addToCart: eventTypeCounts['add_to_cart'] || 0,
        purchases: eventTypeCounts['purchase'] || 0,
      },
      charts: {
        dailyEvents: chartData,
        topPages: topPagesList,
        eventTypes: Object.entries(eventTypeCounts).map(([type, count]) => ({ type, count }))
      },
      period: {
        startDate,
        endDate
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur dans analytics dashboard API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 