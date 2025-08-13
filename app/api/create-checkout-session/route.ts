import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession';
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { items, addressId, mode = 'payment', applyPromoMode = 'NONE', promotionCodeId = null } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Panier vide' },
        { status: 400 }
      );
    }

    if (!addressId) {
      return NextResponse.json(
        { error: 'Adresse de livraison requise' },
        { status: 400 }
      );
    }

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer l'adresse de livraison
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', user.id)
      .single();

    if (addressError || !address) {
      return NextResponse.json(
        { error: 'Adresse de livraison non trouvée' },
        { status: 400 }
      );
    }

    // Créer la session de checkout
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { sessionId, orderId } = await createCheckoutSession({
      items,
      userId: user.id,
      userEmail: user.email!,
      address,
      successUrl: `${siteUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/panier`,
      mode,
      applyPromoMode,
      promotionCodeId,
    });

    return NextResponse.json({ 
      sessionId,
      orderId 
    });

  } catch (error: any) {
    console.error('Erreur création session Stripe:', {
      message: error?.message,
      applyPromoMode: (await request.json?.())?.applyPromoMode,
      promotionCodeId: (await request.json?.())?.promotionCodeId,
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}