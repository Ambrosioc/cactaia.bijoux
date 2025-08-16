import { stripe } from '@/lib/stripe/config';
import { NextRequest, NextResponse } from 'next/server';

// Liste paginée des promotion codes actifs
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const starting_after = searchParams.get('starting_after') || undefined;
		const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

		const promos = await stripe.promotionCodes.list({
			active: true,
			limit,
			starting_after: starting_after as any,
		});

		// Récupérer les détails des coupons pour chaque code promotionnel
		const promosWithDetails = await Promise.all(
			promos.data.map(async (promo) => {
				if (promo.coupon) {
					const coupon = await stripe.coupons.retrieve(promo.coupon.id);
					return {
						id: promo.id,
						code: promo.code,
						name: promo.code, // Utiliser le code comme nom par défaut
						discount_type: coupon.percent_off ? 'percentage' : 'fixed_amount',
						discount_amount: coupon.percent_off || coupon.amount_off || 0,
						max_redemptions: coupon.max_redemptions,
						times_redeemed: promo.times_redeemed || 0,
						valid: promo.active,
						expires_at: promo.expires_at ? new Date(promo.expires_at * 1000).toISOString() : null,
						created_at: new Date(promo.created * 1000).toISOString(),
					};
				}
				return null;
			})
		);

		const validPromos = promosWithDetails.filter(promo => promo !== null);

		return NextResponse.json(validPromos);
	} catch (error: any) {
		console.error('Erreur lors de la récupération des codes promotionnels:', error);
		return NextResponse.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
	}
}

// Créer un nouveau code promotionnel
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { code, name, discount_type, discount_amount, max_redemptions, expires_at } = body;

		// Validation des données
		if (!code || !discount_amount) {
			return NextResponse.json(
				{ error: 'Code et montant de réduction requis' },
				{ status: 400 }
			);
		}

		// Créer le coupon Stripe
		const couponData: any = {
			id: code.toLowerCase().replace(/[^a-z0-9]/g, '_'),
			currency: 'eur',
		};

		if (discount_type === 'percentage') {
			couponData.percent_off = discount_amount;
		} else {
			couponData.amount_off = Math.round(discount_amount * 100); // Convertir en centimes
		}

		if (max_redemptions) {
			couponData.max_redemptions = max_redemptions;
		}

		if (expires_at) {
			couponData.redeem_by = Math.floor(new Date(expires_at).getTime() / 1000);
		}

		// Créer le coupon
		const coupon = await stripe.coupons.create(couponData);

		// Créer le code promotionnel
		const promotionCode = await stripe.promotionCodes.create({
			coupon: coupon.id,
			code: code.toUpperCase(),
			max_redemptions: max_redemptions || undefined,
			expires_at: expires_at ? Math.floor(new Date(expires_at).getTime() / 1000) : undefined,
		});

		return NextResponse.json({
			success: true,
			message: 'Code promotionnel créé avec succès',
			data: {
				id: promotionCode.id,
				code: promotionCode.code,
				name: name || code,
				discount_type,
				discount_amount,
				max_redemptions,
				times_redeemed: 0,
				valid: promotionCode.active,
				expires_at,
				created_at: new Date().toISOString(),
			},
		});
	} catch (error: any) {
		console.error('Erreur lors de la création du code promotionnel:', error);
		return NextResponse.json(
			{ error: error?.message || 'Erreur lors de la création du code promotionnel' },
			{ status: 500 }
		);
	}
}


