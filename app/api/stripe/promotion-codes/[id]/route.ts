import { stripe } from '@/lib/stripe/config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: any) {
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

// Supprimer un code promotionnel
export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const { id } = params;
    if (!id || !id.startsWith('promo_')) {
      return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    }

    // Récupérer le code promotionnel pour obtenir l'ID du coupon
    const promo = await stripe.promotionCodes.retrieve(id);
    const couponId = (promo.coupon as any)?.id as string | undefined;

    // Supprimer le code promotionnel
    await stripe.promotionCodes.update(id, { active: false });

    // Supprimer le coupon associé s'il existe
    if (couponId) {
      try {
        await stripe.coupons.del(couponId);
      } catch (couponError) {
        console.warn('Impossible de supprimer le coupon:', couponError);
        // Continuer même si la suppression du coupon échoue
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Code promotionnel supprimé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du code promotionnel:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}


