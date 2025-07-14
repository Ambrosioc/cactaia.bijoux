import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    
    const productId = searchParams.get('product_id');
    const movementType = searchParams.get('movement_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        produits (
          id,
          nom,
          sku
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (movementType) {
      query = query.eq('movement_type', movementType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des mouvements de stock:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des mouvements de stock' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Erreur dans stock movements GET API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    
    const { product_id, movement_type, quantity, reason, reference, notes } = body;

    // Validation des données requises
    if (!product_id || !movement_type || !quantity) {
      return NextResponse.json(
        { error: 'product_id, movement_type et quantity sont requis' },
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

    // Vérifier que le produit existe
    const { data: product, error: productError } = await supabase
      .from('produits')
      .select('id, stock')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Calculer la nouvelle quantité de stock
    let newStockQuantity = product.stock;
    if (movement_type === 'in') {
      newStockQuantity += quantity;
    } else if (movement_type === 'out') {
      newStockQuantity -= quantity;
      if (newStockQuantity < 0) {
        return NextResponse.json(
          { error: 'Stock insuffisant' },
          { status: 400 }
        );
      }
    } else if (movement_type === 'adjustment') {
      newStockQuantity = quantity;
    }

    // Insérer le mouvement de stock
    const { data: movement, error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        product_id,
        movement_type,
        quantity,
        previous_quantity: product.stock,
        new_quantity: newStockQuantity,
        reason,
        reference,
        notes,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (movementError) {
      console.error('Erreur lors de l\'insertion du mouvement de stock:', movementError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement du mouvement de stock' },
        { status: 500 }
      );
    }

    // Mettre à jour le stock du produit
    const { error: updateError } = await supabase
      .from('produits')
      .update({ stock: newStockQuantity })
      .eq('id', product_id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du stock:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du stock' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: movement }, { status: 201 });

  } catch (error) {
    console.error('Erreur dans stock movements POST API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 