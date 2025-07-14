import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerClient();

    const { data: products, error } = await supabase
      .from('produits')
      .select('*')
      .eq('est_actif', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des produits' }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 