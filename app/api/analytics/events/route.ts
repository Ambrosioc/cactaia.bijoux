import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    
    const { event_type, page_url, user_id, metadata, session_id, product_id, product_name, product_price, search_term, order_id, order_total } = body;

    // Validation des données requises
    if (!event_type || !page_url) {
      return NextResponse.json(
        { error: 'event_type et page_url sont requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur actuel si connecté
    const { data: { user } } = await supabase.auth.getUser();
    const finalUserId = user_id || user?.id;

    // Insérer l'événement
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        page_url,
        session_id: session_id,
        product_id: product_id,
        product_name: product_name,
        product_price: product_price,
        search_term: search_term,
        order_id: order_id,
        order_total: order_total,
        user_id: finalUserId,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'insertion de l\'événement analytics:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement de l\'événement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });

  } catch (error) {
    console.error('Erreur dans analytics events API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    
    const eventType = searchParams.get('event_type');
    const pageUrl = searchParams.get('page_url');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (pageUrl) {
      query = query.eq('page_url', pageUrl);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des événements' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Erreur dans analytics events GET API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 