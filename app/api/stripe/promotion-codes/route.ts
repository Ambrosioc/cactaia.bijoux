import { stripe } from '@/lib/stripe/config';
import { NextRequest, NextResponse } from 'next/server';

// Liste paginée des promotion codes actifs (sécuriser derrière auth si besoin)
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

		return NextResponse.json({
			data: promos.data.map(p => ({
				id: p.id,
				code: p.code,
				active: p.active,
				coupon: p.coupon?.id,
				expires_at: (p.expires_at as any) || null,
			})),
			has_more: promos.has_more,
			last_id: promos.data.length ? promos.data[promos.data.length - 1].id : null,
		});
	} catch (error: any) {
		return NextResponse.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
	}
}


