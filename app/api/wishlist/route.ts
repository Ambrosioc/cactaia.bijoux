import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET - Récupérer la wishlist de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer la wishlist avec les détails des produits
    const { data: wishlistItems, error } = await supabase
      .from('wishlist_with_products')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération de la wishlist:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de la wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ wishlistItems });

  } catch (error) {
    console.error('Erreur dans wishlist GET API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Ajouter un produit à la wishlist
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: 'product_id est requis' },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe et est actif
    const { data: product, error: productError } = await supabase
      .from('produits')
      .select('id, nom')
      .eq('id', product_id)
      .eq('est_actif', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produit non trouvé ou non disponible' },
        { status: 404 }
      );
    }

    // Ajouter à la wishlist
    const { data: wishlistItem, error: insertError } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: user.id,
        product_id: product_id
      })
      .select()
      .single();

    if (insertError) {
      // Si c'est une erreur de contrainte unique, le produit est déjà dans la wishlist
      if (insertError.code === '23505') {
        return NextResponse.json(
          { message: 'Produit déjà dans la wishlist', alreadyExists: true },
          { status: 200 }
        );
      }
      
      console.error('Erreur lors de l\'ajout à la wishlist:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout à la wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Produit ajouté à la wishlist',
      wishlistItem
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur dans wishlist POST API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit de la wishlist
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    if (!product_id) {
      return NextResponse.json(
        { error: 'product_id est requis' },
        { status: 400 }
      );
    }

    // Supprimer de la wishlist
    const { error: deleteError } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', product_id);

    if (deleteError) {
      console.error('Erreur lors de la suppression de la wishlist:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de la wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Produit supprimé de la wishlist'
    });

  } catch (error) {
    console.error('Erreur dans wishlist DELETE API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 