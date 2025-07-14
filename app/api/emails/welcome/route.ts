import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail';
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id est requis' },
        { status: 400 }
      );
    }

    // Vérifier l'authentification
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    // Vérifier si l'utilisateur est admin ou s'il s'agit de son propre compte
    const isAdmin = authUser ? (await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single()).data?.role === 'admin' : false;
    
    const isSelf = authUser?.id === user_id;
    
    if (authError || (!isAdmin && !isSelf)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Envoyer l'email de bienvenue
    const result = await sendWelcomeEmail({
      user: userData,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur API email de bienvenue:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}