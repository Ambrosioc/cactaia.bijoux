import { stripe } from '@/lib/stripe/config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id || !id.startsWith('promo_')) {
      return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    }

    const promo = await stripe.promotionCodes.retrieve(id);
    const couponId = (promo.coupon as any)?.id as string | undefined;
    let coupon: any = null;
    if (couponId) {
      coupon = await stripe.coupons.retrieve(couponId);
    }

    return NextResponse.json({
      id: promo.id,
      code: promo.code,
      active: promo.active,
      restrictions: (promo as any).restrictions || null,
      coupon: coupon
        ? {
            id: coupon.id,
            percent_off: (coupon as any).percent_off ?? null,
            amount_off: (coupon as any).amount_off ?? null,
            currency: (coupon as any).currency ?? null,
            duration: (coupon as any).duration ?? null,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}


