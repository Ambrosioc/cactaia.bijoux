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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const eventType = searchParams.get('event_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const productName = searchParams.get('product_name');

    // Construire la requête
    let query = supabase
      .from('analytics_events')
      .select('*', { count: 'exact' });

    // Appliquer les filtres
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (productName) {
      query = query.ilike('product_name', `%${productName}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Trier par date de création (plus récent en premier)
    query = query.order('created_at', { ascending: false });

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Erreur récupération événements analytics:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Erreur API analytics events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { event_type, page_url, session_id, product_name, product_price, order_total, metadata } = body;

    // Validation des données
    if (!event_type || !page_url) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Créer l'événement
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        page_url,
        session_id: session_id || null,
        product_name: product_name || null,
        product_price: product_price || null,
        order_total: order_total || null,
        metadata: metadata || {},
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création événement analytics:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });

  } catch (error) {
    console.error('Erreur API analytics events POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 