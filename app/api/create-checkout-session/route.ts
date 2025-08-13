import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession';
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Rate limit basique en mémoire (par IP)
const RL_WINDOW_MS = 60_000; // 60s
const RL_MAX_REQ = 15; // 15 req/min
const rlStore: Map<string, { count: number; resetAt: number }> = (global as any).__apiRatelimit || new Map();
(global as any).__apiRatelimit = rlStore;

function isRateLimited(ip: string | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  const entry = rlStore.get(ip);
  if (!entry) {
    rlStore.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return false;
  }
  if (now > entry.resetAt) {
    rlStore.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  rlStore.set(ip, entry);
  return entry.count > RL_MAX_REQ;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const payload = await request.json();
    const { items, addressId, mode = 'payment', applyPromoMode = 'NONE', promotionCodeId = null } = payload;

    // Rate limit
    const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '')
      .split(',')[0]
      .trim() || null;
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez dans quelques instants.' },
        { status: 429 }
      );
    }

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
      applyPromoMode: 'body-parsed',
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}