'use client';

import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/userStore';
import { useEffect } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, clearUser, setLoading } = useUserStore();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        setLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          if (mounted) {
            clearUser();
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          // Récupérer le profil utilisateur
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Erreur lors de la récupération du profil:', profileError);
            clearUser();
          } else if (userProfile) {
            setUser(userProfile);
          } else {
            clearUser();
          }
        } else if (mounted) {
          clearUser();
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la session:', error);
        if (mounted) {
          clearUser();
          setLoading(false);
        }
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Changement d\'état d\'authentification:', event);

        if (mounted) {
          setLoading(true);

          if (session?.user) {
            // Récupérer le profil utilisateur
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileError) {
              console.error('Erreur lors de la récupération du profil:', profileError);
              clearUser();
            } else if (userProfile) {
              setUser(userProfile);
            } else {
              clearUser();
            }
          } else {
            clearUser();
          }

          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, clearUser, setLoading]);

  return <>{children}</>;
}