import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status'); // 'active', 'resolved'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('stock_alerts')
      .select(`
        *,
        produits (
          id,
          nom,
          sku,
          stock
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des alertes de stock:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des alertes de stock' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Erreur dans stock alerts GET API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    const { alert_id, action, notes } = body;

    // Validation des données requises
    if (!alert_id || !action) {
      return NextResponse.json(
        { error: 'alert_id et action sont requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'alerte existe
    const { data: alert, error: alertError } = await supabase
      .from('stock_alerts')
      .select('*')
      .eq('id', alert_id)
      .single();

    if (alertError || !alert) {
      return NextResponse.json(
        { error: 'Alerte non trouvée' },
        { status: 404 }
      );
    }

    // Mettre à jour l'alerte
    const updateData: any = {
      status: action === 'resolve' ? 'resolved' : 'active',
      resolved_at: action === 'resolve' ? new Date().toISOString() : null,
      resolved_by: action === 'resolve' ? user.id : null,
      notes: notes || alert.notes
    };

    const { data: updatedAlert, error: updateError } = await supabase
      .from('stock_alerts')
      .update(updateData)
      .eq('id', alert_id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour de l\'alerte:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'alerte' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedAlert });

  } catch (error) {
    console.error('Erreur dans stock alerts POST API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 