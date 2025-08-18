import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const rating = searchParams.get('rating');
    const status = searchParams.get('status') || 'approved';

    // Construire la requête (sans relations pour l'instant)
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' });

    // Appliquer les filtres
    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Trier par date de création (plus récent en premier)
    query = query.order('created_at', { ascending: false });

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Erreur récupération avis:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Erreur API reviews GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, rating, title, comment } = body;

    // Validation des données
    if (!product_id || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide' }, { status: 400 });
    }

    // Vérifier que l'utilisateur a acheté le produit (avis vérifié)
    const { data: orders, error: ordersError } = await supabase
      .from('commandes')
      .select('*')
      .eq('user_id', user.id)
      .eq('statut', 'payee');

    let isVerifiedPurchase = false;
    if (orders && orders.length > 0) {
      // Vérifier si le produit est dans une des commandes
      for (const order of orders) {
        if (order.produits && Array.isArray(order.produits)) {
          const hasProduct = order.produits.some((item: any) => 
            item.product_id === product_id
          );
          if (hasProduct) {
            isVerifiedPurchase = true;
            break;
          }
        }
      }
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour ce produit' }, { status: 400 });
    }

    // Créer l'avis
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id: user.id,
        rating,
        title,
        comment,
        is_verified_purchase: isVerifiedPurchase,
        status: 'pending' // En attente de modération
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création avis:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      review: data,
      message: isVerifiedPurchase 
        ? 'Avis créé avec succès (achat vérifié)' 
        : 'Avis créé avec succès (en attente de vérification)'
    });

  } catch (error) {
    console.error('Erreur API reviews POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { review_id, rating, title, comment } = body;

    if (!review_id) {
      return NextResponse.json({ error: 'ID d\'avis manquant' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est l'auteur de l'avis ou un admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const { data: review } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', review_id)
      .single();

    if (!review) {
      return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
    }

    const isAuthor = review.user_id === user.id;
    const isAdmin = userProfile?.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Mettre à jour l'avis
    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.comment = comment;

    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', review_id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour avis:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });

  } catch (error) {
    console.error('Erreur API reviews PUT:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'ID d\'avis manquant' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est l'auteur de l'avis ou un admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const { data: review } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (!review) {
      return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
    }

    const isAuthor = review.user_id === user.id;
    const isAdmin = userProfile?.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Supprimer l'avis
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Erreur suppression avis:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur API reviews DELETE:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 