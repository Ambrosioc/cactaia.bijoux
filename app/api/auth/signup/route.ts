import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    
    const { 
      email, 
      password, 
      nom, 
      prenom, 
      genre, 
      dateNaissance, 
      cgvAccepted, 
      newsletter 
    } = body;

    // Validation des données
    if (!email || !password || !nom || !prenom || !genre || !dateNaissance || !cgvAccepted) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Erreur Supabase Auth:', authError);
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà utilisée' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'utilisateur' },
        { status: 500 }
      );
    }

    // Attendre un peu que l'utilisateur soit créé dans auth.users
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mettre à jour le profil utilisateur dans la table users (il existe déjà grâce au trigger)
    const { error: profileError } = await supabase
      .from('users')
      .update({
        email: email,
        nom: nom,
        prenom: prenom,
        genre: genre,
        date_naissance: dateNaissance,
        cgv_accepted: cgvAccepted,
        cgv_accepted_at: new Date().toISOString(),
        newsletter: newsletter || false,
        profile_completed: true,
        active_role: 'user'
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Erreur création profil:', profileError);
      
      // Si la création du profil échoue, on ne peut pas supprimer l'utilisateur auth
      // car on n'a pas les permissions admin, mais on peut retourner une erreur
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil utilisateur. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // Envoyer l'email de bienvenue
    try {
      const emailResponse = await fetch(`${request.nextUrl.origin}/api/emails/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: authData.user.id,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Erreur envoi email de bienvenue:', emailResponse.status);
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: email,
        nom: nom,
        prenom: prenom,
        profile_completed: true
      },
      message: 'Compte créé avec succès'
    });

  } catch (error) {
    console.error('Erreur générale inscription:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}
