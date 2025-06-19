import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

interface CachedSession {
  user: User | null;
  userProfile: {
    role: string;
    active_role: string;
  } | null;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const SESSION_CACHE_KEY = 'cactaia_session_cache';

export function useSession() {
  const [session, setSession] = useState<CachedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Récupérer la session depuis le cache d'abord
    const cachedSession = getCachedSession();
    if (cachedSession && isCacheValid(cachedSession.timestamp)) {
      setSession(cachedSession);
      setLoading(false);
    }

    // Récupérer la session actuelle
    const getSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          // Récupérer le profil utilisateur
          const { data: userProfile } = await supabase
            .from('users')
            .select('role, active_role')
            .eq('id', currentSession.user.id)
            .single();

          const sessionData: CachedSession = {
            user: currentSession.user,
            userProfile: userProfile || null,
            timestamp: Date.now()
          };

          // Mettre en cache
          cacheSession(sessionData);
          setSession(sessionData);
        } else {
          // Pas de session, nettoyer le cache
          clearCachedSession();
          setSession(null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Récupérer le profil utilisateur
          const { data: userProfile } = await supabase
            .from('users')
            .select('role, active_role')
            .eq('id', currentSession.user.id)
            .single();

          const sessionData: CachedSession = {
            user: currentSession.user,
            userProfile: userProfile || null,
            timestamp: Date.now()
          };

          cacheSession(sessionData);
          setSession(sessionData);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          clearCachedSession();
          setSession(null);
          setLoading(false);
        }
      }
    );

    // Écouter les changements de profil utilisateur (pour les changements de rôle)
    const channel = supabase
      .channel('user_profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: session?.user ? `id=eq.${session.user.id}` : undefined
        },
        async (payload) => {
          // Rafraîchir la session quand le profil change
          if (session?.user) {
            const sessionData: CachedSession = {
              user: session.user,
              userProfile: payload.new as any,
              timestamp: Date.now()
            };
            cacheSession(sessionData);
            setSession(sessionData);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [supabase.auth, session?.user?.id]);

  return {
    session,
    loading,
    user: session?.user || null,
    userProfile: session?.userProfile || null,
    isAdmin: session?.userProfile?.active_role === 'admin',
    isUser: session?.userProfile?.active_role === 'user'
  };
}

// Fonctions utilitaires pour le cache
function getCachedSession(): CachedSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function cacheSession(session: CachedSession) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
  } catch {
    // Ignorer les erreurs de localStorage
  }
}

function clearCachedSession() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // Ignorer les erreurs de localStorage
  }
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
} 