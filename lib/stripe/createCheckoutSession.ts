import { createServerClient } from '@/lib/supabase/server';
import type { Address } from '@/lib/supabase/types';
import type { CartItem } from '@/stores/cartStore';
import type Stripe from 'stripe';
import { stripe, STRIPE_CONFIG } from './config';

type ApplyPromoMode = 'FIELD' | 'AUTO' | 'NONE';

interface CreateCheckoutSessionParams {
  items: CartItem[];
  userId: string;
  userEmail: string;
  address: Address;
  successUrl: string;
  cancelUrl: string;
  mode?: 'payment' | 'subscription';
  applyPromoMode?: ApplyPromoMode;
  promotionCodeId?: string | null;
}

export async function createCheckoutSession({
  items,
  userId,
  userEmail,
  address,
  successUrl,
  cancelUrl,
  mode = 'payment',
  applyPromoMode = 'NONE',
  promotionCodeId = null,
}: CreateCheckoutSessionParams) {
  const supabase = await createServerClient();

  // Vérifier les produits et calculer le total
  const productIds = items.map(item => item.product.id);
  const { data: products, error: productsError } = await supabase
    .from('produits')
    .select('*')
    .in('id', productIds)
    .eq('est_actif', true);

  if (productsError || !products || products.length !== items.length) {
    throw new Error('Certains produits ne sont plus disponibles');
  }

  // Vérifier le stock et calculer le montant
  let totalAmount = 0;
  const orderProducts = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.product.id);
    if (!product) {
      throw new Error(`Produit ${item.product.nom} non trouvé`);
    }

    if ((product.stock ?? 0) < item.quantity) {
      throw new Error(`Stock insuffisant pour ${product.nom}`);
    }

    const price = product.prix_promo && product.prix_promo < product.prix 
      ? product.prix_promo 
      : product.prix;

    totalAmount += price * item.quantity;

    orderProducts.push({
      product_id: product.id,
      nom: product.nom,
      prix: price,
      quantite: item.quantity,
      image: product.images?.[0] || null,
      sku: product.sku,
      variations: item.selectedVariations || {}
    });
  }

  // Ajouter les frais de livraison
  const shipping = totalAmount >= STRIPE_CONFIG.shipping_options.free_shipping_threshold 
    ? 0 
    : STRIPE_CONFIG.shipping_options.standard_shipping_cost;
  totalAmount += shipping;

  // Créer la commande en base
  const { data: order, error: orderError } = await supabase
    .from('commandes')
    .insert({
      user_id: userId,
      numero_commande: `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      produits: orderProducts,
      montant_total: totalAmount,
      statut: 'en_attente',
      adresse_livraison: {
        nom_complet: address.nom_complet,
        ligne_1: address.ligne_1,
        ligne_2: address.ligne_2,
        code_postal: address.code_postal,
        ville: address.ville,
        pays: address.pays,
        telephone: address.telephone
      }
    })
    .select()
    .single();

  if (orderError) {
    throw new Error('Erreur lors de la création de la commande');
  }

  // Créer ou récupérer le customer Stripe
  let customerId: string | undefined;
  
  const existingCustomers = await stripe.customers.list({
    email: userEmail,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    customerId = existingCustomers.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        user_id: userId,
      },
    });
    customerId = customer.id;
  }

  // Créer les line items pour Stripe
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const lineItems = orderProducts.map(product => ({
    price_data: {
      currency: STRIPE_CONFIG.currency,
      product_data: {
        name: product.nom,
        images: product.image
          ? [new URL(product.image.startsWith('http') ? product.image : `${siteUrl}${product.image}`).toString()]
          : [],
        metadata: {
          product_id: product.product_id,
          sku: product.sku || '',
        }
      },
      unit_amount: Math.round(product.prix * 100), // Stripe utilise les centimes
    },
    quantity: product.quantite,
  }));

  // Ajouter les frais de livraison si nécessaire
  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: STRIPE_CONFIG.currency,
        product_data: {
          name: 'Frais de livraison',
          images: [],
          metadata: {
            product_id: 'shipping',
            sku: 'shipping',
          }
        },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });
  }

  // Préparer les paramètres communs
  const baseSessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    payment_method_types: [...STRIPE_CONFIG.payment_method_types],
    line_items: lineItems,
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      order_id: order.id,
      user_id: userId,
      applyPromoMode,
      promotionCodeId: promotionCodeId || '',
      mode,
    },
    shipping_address_collection: {
      allowed_countries: [...STRIPE_CONFIG.allowed_countries],
    },
    billing_address_collection: 'required',
    customer_update: {
      shipping: 'auto',
    },
    payment_intent_data: {
      metadata: {
        order_id: order.id,
        user_id: userId,
      }
    },
    invoice_creation: {
      enabled: true,
    },
    automatic_tax: {
      enabled: true, // Activez si vous voulez la gestion automatique de la TVA
    },
  };

  // Logique promotions
  const promoLogs: Record<string, any> = { stage: 'promo_config', applyPromoMode, promotionCodeId };
  try {
    if (STRIPE_CONFIG.promotions.enabled) {
      if (applyPromoMode === 'FIELD') {
        (baseSessionParams as any).allow_promotion_codes = true;
      } else if (applyPromoMode === 'AUTO') {
        (baseSessionParams as any).allow_promotion_codes = true; // on peut laisser le champ actif
        if (!promotionCodeId || !promotionCodeId.startsWith('promo_')) {
          throw new Error('PromotionCodeId invalide (attendu: id commençant par promo_)');
        }
        // Validation optionnelle côté backend (redeemable)
        const promo = await stripe.promotionCodes.retrieve(promotionCodeId);
        promoLogs.promo = { id: promo.id, active: promo.active, code: promo.code, coupon: promo.coupon?.id };
        if (!promo.active) {
          throw new Error('Le code promotionnel est inactif ou expiré');
        }
        (baseSessionParams as any).discounts = [{ promotion_code: promotionCodeId }];
      }
    }
  } catch (promoError: any) {
    console.error('StripePromo validation error:', { message: promoError.message, ...promoLogs });
    throw new Error(promoError.message || 'Code promotionnel invalide');
  }

  // Créer la session Stripe Checkout
  const session = await stripe.checkout.sessions.create(baseSessionParams);

  // Mettre à jour la commande avec l'ID de session Stripe
  await supabase
    .from('commandes')
    .update({ stripe_session_id: session.id })
    .eq('id', order.id);

  return {
    sessionId: session.id,
    orderId: order.id,
  };
}