import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Récupérer la session avec cache
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Routes protégées admin - nécessite role = 'admin' ET active_role = 'admin'
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      const redirectUrl = new URL('/connexion', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    try {
      // Vérifier le rôle admin et active_role
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('role, active_role, profile_completed')
        .eq('id', session.user.id)
        .single();

      // Si l'utilisateur n'est pas admin, rediriger vers le compte
      if (error || !userProfile || userProfile.role !== 'admin' || userProfile.active_role !== 'admin') {
        return NextResponse.redirect(new URL('/compte', req.url));
      }
    } catch (error) {
      // En cas d'erreur, rediriger vers le compte utilisateur
      return NextResponse.redirect(new URL('/compte', req.url));
    }
  }

  // Routes protégées utilisateur - nécessite active_role = 'user'
  if (req.nextUrl.pathname.startsWith('/compte')) {
    if (!session) {
      const redirectUrl = new URL('/connexion', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    try {
      // Vérifier que l'utilisateur est en mode user
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('role, active_role, profile_completed')
        .eq('id', session.user.id)
        .single();

      // Si l'utilisateur est en mode admin, rediriger vers admin
      if (!error && userProfile && userProfile.active_role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    } catch (error) {
      // En cas d'erreur, permettre l'accès au compte
    }
  }

  // Vérifier si l'utilisateur a un profil complet pour toutes les routes sauf auth et inscription
  if (session && !req.nextUrl.pathname.startsWith('/admin') && 
      !req.nextUrl.pathname.startsWith('/compte') && 
      req.nextUrl.pathname !== '/connexion' && 
      req.nextUrl.pathname !== '/inscription' &&
      req.nextUrl.pathname !== '/api') {
    
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('profile_completed, active_role')
        .eq('id', session.user.id)
        .single();

      // Si le profil n'est pas complété et que l'utilisateur n'est pas admin, rediriger vers l'inscription
      if (!error && userProfile && !userProfile.profile_completed && userProfile.active_role !== 'admin') {
        return NextResponse.redirect(new URL('/inscription', req.url));
      }
    } catch (error) {
      // En cas d'erreur, permettre l'accès
    }
  }

  // Rediriger les utilisateurs connectés loin des pages d'auth
  if ((req.nextUrl.pathname === '/connexion' || req.nextUrl.pathname === '/inscription') && session) {
    try {
      // Déterminer où rediriger selon le rôle actif
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('role, active_role, profile_completed')
        .eq('id', session.user.id)
        .single();

      if (!error && userProfile?.active_role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      } else if (!error && userProfile?.profile_completed) {
        return NextResponse.redirect(new URL('/compte', req.url));
      }
      // Si le profil n'est pas complété, rester sur la page d'inscription pour l'étape 2
    } catch (error) {
      // En cas d'erreur, rediriger vers le compte par défaut
      return NextResponse.redirect(new URL('/compte', req.url));
    }
  }

  // Ajouter des headers pour optimiser le cache
  res.headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
  
  return res;
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/compte/:path*', 
    '/connexion', 
    '/inscription',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};