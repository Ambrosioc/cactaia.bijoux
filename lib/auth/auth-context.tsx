'use client';

import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/supabase/types';
import { User as AuthUser } from '@supabase/auth-helpers-nextjs';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  userProfile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchRole: (role: 'user' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUserProfile = async (userId?: string) => {
    try {
      // Utiliser l'ID fourni ou récupérer l'utilisateur actuel
      let targetUserId = userId;

      if (!targetUserId) {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
          return null;
        }

        if (!currentUser) {
          console.log('Aucun utilisateur connecté');
          return null;
        }

        targetUserId = currentUser.id;
      }

      // Requête simple et directe sans dépendances circulaires
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) {
        // Gestion spécifique des erreurs
        if (error.code === 'PGRST116') {
          console.log('Profil utilisateur non trouvé pour l\'ID:', targetUserId);
          return null;
        }

        console.error('Erreur lors de la récupération du profil:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      if (!data) {
        console.log('Aucune donnée de profil trouvée pour l\'ID:', targetUserId);
        return null;
      }

      console.log('Profil utilisateur récupéré avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur inattendue lors de la récupération du profil:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  const switchRole = async (role: 'user' | 'admin') => {
    try {
      const { error } = await supabase.rpc('switch_active_role', {
        new_active_role: role
      });

      if (error) {
        throw error;
      }

      await refreshProfile();
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setLoading(false);
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);

          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setUserProfile(profile);
            }
          } else {
            setUserProfile(null);
          }

          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Changement d\'état d\'authentification:', event);

        if (mounted) {
          setUser(session?.user ?? null);

          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setUserProfile(profile);
            }
          } else {
            setUserProfile(null);
          }

          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signOut,
      refreshProfile,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};