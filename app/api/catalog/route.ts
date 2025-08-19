import { CDN_S_MAXAGE_PLP, CDN_STALE_WHILE_REVALIDATE_PLP, PERF_OPTIMIZATIONS_ENABLED } from '@/lib/config/perf';
import { createServerClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const fetchCache = 'default-cache';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') ?? undefined;
    const collection = url.searchParams.get('collection') ?? undefined;
    const searchTerm = url.searchParams.get('q') ?? '';
    const sortBy = url.searchParams.get('sort') ?? 'newest';
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
    const limit = Math.min(48, Math.max(1, Number(url.searchParams.get('limit') ?? '12')));

    const tags = [
      'products',
      category ? `category:${category}` : '',
      collection ? `collection:${collection}` : '',
    ].filter(Boolean) as string[];

    const key = [`catalog`, category ?? 'all', collection ?? 'all', searchTerm || '-', sortBy, String(page), String(limit)].join(':');

    const result = await unstable_cache(
      async () => {
        const supabase = await createServerClient();
        let query = supabase
          .from('produits')
          .select('*', { count: 'exact' })
          .or('est_actif.is.true,est_actif.is.null');

        if (category && category !== 'all') {
          query = query.ilike('categorie', `%${category}%`);
        }
        if (collection) {
          query = query.contains('collections', [collection]);
        }
        if (searchTerm) {
          query = query.or(`nom.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        switch (sortBy) {
          case 'price_asc':
            query = query.order('prix', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('prix', { ascending: false });
            break;
          case 'name':
            query = query.order('nom', { ascending: true });
            break;
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) throw error;
        return { products: data ?? [], total: count ?? 0 };
      },
      [key],
      { tags }
    )();

    const res = NextResponse.json(result);
    if (PERF_OPTIMIZATIONS_ENABLED) {
      res.headers.set('Cache-Control', `public, s-maxage=${CDN_S_MAXAGE_PLP}, stale-while-revalidate=${CDN_STALE_WHILE_REVALIDATE_PLP}`);
    }
    return res;
  } catch (error) {
    console.error('Erreur catalog API:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}


