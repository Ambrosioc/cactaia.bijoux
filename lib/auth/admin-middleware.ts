import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function verifyAdminAccess(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: 'Non autorisé',
        status: 401
      };
    }

    // Vérifier le rôle admin
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, nom_complet, email')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return {
        success: false,
        error: 'Profil utilisateur non trouvé',
        status: 404
      };
    }

    if (userProfile.role !== 'admin') {
      return {
        success: false,
        error: 'Accès refusé - Rôle admin requis',
        status: 403,
        user: {
          id: user.id,
          email: userProfile.email,
          nom_complet: userProfile.nom_complet,
          role: userProfile.role
        }
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: userProfile.email,
        nom_complet: userProfile.nom_complet,
        role: userProfile.role
      }
    };

  } catch (error) {
    console.error('Erreur vérification admin:', error);
    return {
      success: false,
      error: 'Erreur serveur',
      status: 500
    };
  }
}

export function createAdminResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function createAdminErrorResponse(error: string, status: number = 500) {
  return NextResponse.json({ error }, { status });
} 