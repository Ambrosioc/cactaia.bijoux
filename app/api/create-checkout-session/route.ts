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

// Mapping d'erreurs -> messages et codes côté client
function mapCheckoutError(errorMessage: string) {
  const normalized = (errorMessage || '').toLowerCase();
  if (normalized.includes('associated customer has prior transactions') || normalized.includes('premier achat')) {
    return { code: 'PROMO_FIRST_TIME_ONLY', userMessage: "Ce code est réservé au premier achat. Choisissez un autre code ou laissez le champ pour en saisir un sur la page de paiement." };
  }
  if (normalized.includes('promotioncodeid invalide')) {
    return { code: 'INVALID_PROMOTION_CODE_ID', userMessage: "Identifiant du code promotionnel invalide (format attendu: 'promo_...')." };
  }
  if (normalized.includes('inactif') || normalized.includes('expiré')) {
    return { code: 'PROMO_INACTIVE', userMessage: "Ce code promotionnel est inactif ou expiré." };
  }
  if (normalized.includes('montant minimum')) {
    return { code: 'PROMO_MINIMUM_NOT_REACHED', userMessage: "Le montant minimum d'achat pour ce code n'est pas atteint." };
  }
  if (normalized.includes('stock insuffisant')) {
    return { code: 'OUT_OF_STOCK', userMessage: "Stock insuffisant pour l'un des articles du panier." };
  }
  if (normalized.includes('ne sont plus disponibles')) {
    return { code: 'PRODUCT_UNAVAILABLE', userMessage: "Certains produits ne sont plus disponibles." };
  }
  return { code: 'CHECKOUT_SESSION_FAILED', userMessage: "Impossible de créer la session de paiement. Réessayez ou contactez le support." };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const payload = await request.json();
    const { items, addressId, applyPromoMode = 'NONE', promotionCodeId = null } = payload;

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
      applyPromoMode,
      promotionCodeId,
    });

    return NextResponse.json({ 
      sessionId,
      orderId 
    });

  } catch (error: any) {
    const mapped = mapCheckoutError(error?.message || '');
    console.error('Erreur création session Stripe:', {
      message: error?.message,
      code: mapped.code,
    });
    
    return NextResponse.json(
      { error: mapped.userMessage, code: mapped.code },
      { status: 500 }
    );
  }
}