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
    
    // Vérifier si l'utilisateur est admin, s'il s'agit de son propre compte, ou s'il s'agit d'un nouvel utilisateur
    let isAuthorized = false;
    
    if (authUser) {
      // Vérifier si l'utilisateur est admin
      const { data: userRole } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single();
      
      const isAdmin = userRole?.role === 'admin';
      const isSelf = authUser.id === user_id;
      
      isAuthorized = isAdmin || isSelf;
    }
    
    // Si pas d'authentification, vérifier que l'utilisateur existe et est récent (inscription)
    if (!isAuthorized) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', user_id)
        .single();
      
      if (userError || !userData) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }
      
      // Autoriser si l'utilisateur a été créé dans les dernières 5 minutes (inscription récente)
      if (!userData.created_at) {
        return NextResponse.json(
          { error: 'Date de création manquante' },
          { status: 400 }
        );
      }
      
      const userCreated = new Date(userData.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - userCreated.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeDiff > fiveMinutes) {
        return NextResponse.json(
          { error: 'Non autorisé - délai d\'inscription dépassé' },
          { status: 401 }
        );
      }
      
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les informations complètes de l'utilisateur
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
      console.error('Erreur lors de l\'envoi de l\'email:', result.error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: result.messageId });

  } catch (error) {
    console.error('Erreur API email de bienvenue:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}