import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Routes protégées admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/connexion', req.url));
    }

    // Vérifier le rôle admin et active_role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, active_role')
      .eq('id', session.user.id)
      .single();

    if (!userProfile || userProfile.role !== 'admin' || userProfile.active_role !== 'admin') {
      return NextResponse.redirect(new URL('/compte', req.url));
    }
  }

  // Routes protégées utilisateur
  if (req.nextUrl.pathname.startsWith('/compte') || req.nextUrl.pathname.startsWith('/mon-compte')) {
    if (!session) {
      return NextResponse.redirect(new URL('/connexion', req.url));
    }
  }

  // Rediriger les utilisateurs connectés loin des pages d'auth
  if ((req.nextUrl.pathname === '/connexion' || req.nextUrl.pathname === '/inscription') && session) {
    return NextResponse.redirect(new URL('/compte', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/compte/:path*', '/mon-compte/:path*', '/connexion', '/inscription']
};