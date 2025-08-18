import { sendNewsletterWelcomeEmail } from '@/lib/email/sendNewsletterWelcomeEmail';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies });
    
    const body = await request.json();
    const { civilite, prenom, nom, date_naissance, email } = body;

    // Validation des données
    if (!civilite || !prenom || !nom || !date_naissance || !email) {
      return NextResponse.json({ 
        error: 'Tous les champs sont obligatoires' 
      }, { status: 400 });
    }

    // Validation de la civilité
    if (!['Madame', 'Monsieur'].includes(civilite)) {
      return NextResponse.json({ 
        error: 'Civilité invalide' 
      }, { status: 400 });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Adresse e-mail invalide' 
      }, { status: 400 });
    }

    // Validation de la date de naissance
    const birthDate = new Date(date_naissance);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13 || age > 120) {
      return NextResponse.json({ 
        error: 'Date de naissance invalide' 
      }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('id, est_actif')
      .eq('email', email)
      .single();

    if (existingSubscriber) {
      if (existingSubscriber.est_actif) {
        return NextResponse.json({ 
          error: 'Cette adresse e-mail est déjà inscrite à la newsletter' 
        }, { status: 400 });
      } else {
        // Réactiver l'abonnement
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            est_actif: true, 
            date_desinscription: null,
            civilite,
            prenom,
            nom,
            date_naissance
          })
          .eq('email', email)
          .select()
          .single();

        if (error) {
          console.error('Erreur réactivation newsletter:', error);
          return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
        }

        // Envoyer l'email de bienvenue pour la réactivation (sans code de réduction)
        try {
          await sendNewsletterWelcomeEmail({
            subscriber: {
              prenom: data.prenom,
              nom: data.nom,
              email: data.email,
              date_inscription: data.date_inscription as string
            }
          });
        } catch (emailError) {
          console.error('Erreur envoi email réactivation:', emailError);
          // On continue même si l'email échoue
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Abonnement réactivé avec succès !',
          subscriber: data
        });
      }
    }

    // Créer un nouvel abonné
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        civilite,
        prenom,
        nom,
        date_naissance,
        email
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur inscription newsletter:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Envoyer l'email de bienvenue (sans code de réduction)
    try {
      await sendNewsletterWelcomeEmail({
        subscriber: {
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
          date_inscription: data.date_inscription as string
        }
      });
    } catch (emailError) {
      console.error('Erreur envoi email bienvenue:', emailError);
      // On continue même si l'email échoue, l'inscription est quand même validée
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Inscription réussie ! Merci de rejoindre notre newsletter. Vous recevrez nos nouveautés et offres directement par email.',
      subscriber: data
    });

  } catch (error) {
    console.error('Erreur API newsletter POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies });
    
    // Vérifier l'authentification admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier le rôle admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const active = searchParams.get('active');

    // Construire la requête
    let query = supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('date_inscription', { ascending: false });

    // Filtrer par statut actif si spécifié
    if (active !== null) {
      query = query.eq('est_actif', active === 'true');
    }

    // Pagination
    const offset = (page - 1) * limit;
    const { data: subscribers, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur récupération abonnés:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Erreur API newsletter GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 