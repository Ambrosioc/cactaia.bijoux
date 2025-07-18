import { sendOrderConfirmationEmail } from '@/lib/email/sendConfirmationEmail';
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: 'order_id est requis' },
        { status: 400 }
      );
    }

    // Vérifier l'authentification
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les informations de la commande
    const { data: orderData, error: orderError } = await supabase
      .from('commandes')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer l'utilisateur lié à la commande
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, prenom, nom')
      .eq('id', orderData.user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "Utilisateur lié à la commande non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est admin ou s'il s'agit de sa propre commande
    const isAdmin = (await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single()).data?.role === 'admin';
    
    const isOwner = orderData.user_id === authUser.id;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Envoyer l'email de confirmation
    const result = await sendOrderConfirmationEmail({
      order: orderData,
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
    console.error('Erreur API email de confirmation:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}