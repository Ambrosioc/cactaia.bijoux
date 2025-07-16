import { createClient } from '@/lib/supabase/client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'user' | 'admin';
export type Genre = 'Homme' | 'Femme' | 'Autre';

export interface UserProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string | null;
  active_role: string | null;
  genre?: string | null;
  date_naissance?: string | null;
  newsletter: boolean | null;
  cgv_accepted: boolean | null;
  cgv_accepted_at?: string | null;
  profile_completed?: boolean | null;
  created_at: string | null;
}

interface UserStore {
  // État
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  switchRole: (targetRole: Role) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Getters
  isAdmin: () => boolean;
  isActiveAdmin: () => boolean;
  isActiveUser: () => boolean;
  canSwitchToAdmin: () => boolean;
  getDisplayName: () => string;
  getCurrentModeLabel: () => string;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => {
      const supabase = createClient();

      return {
        // État initial
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,

        // Actions
        setUser: (user: UserProfile) => {
          set({
            user,
            isAuthenticated: true,
            error: null,
          });
        },

        clearUser: () => {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        },

        switchRole: async (targetRole: Role) => {
          const currentUser = get().user;
          if (!currentUser) {
            set({ error: 'Aucun utilisateur connecté' });
            return;
          }

          // Vérifier que l'utilisateur peut changer de rôle
          if (currentUser.role !== 'admin') {
            set({ error: 'Seuls les administrateurs peuvent changer de rôle' });
            return;
          }

          set({ loading: true, error: null });

          try {
            // Appeler la fonction RPC Supabase
            const { error } = await supabase.rpc('switch_active_role', {
              new_active_role: targetRole
            });

            if (error) {
              throw error;
            }

            // Mettre à jour l'état local
            set({
              user: { ...currentUser, active_role: targetRole },
              loading: false,
            });

            console.log(`Rôle changé vers: ${targetRole}`);
          } catch (error) {
            console.error('Erreur lors du changement de rôle:', error);
            set({
              error: 'Erreur lors du changement de rôle',
              loading: false,
            });
            throw error;
          }
        },

        updateProfile: async (updates: Partial<UserProfile>) => {
          const currentUser = get().user;
          if (!currentUser) {
            set({ error: 'Aucun utilisateur connecté' });
            return;
          }

          set({ loading: true, error: null });

          try {
            const { error } = await supabase
              .from('users')
              .update(updates)
              .eq('id', currentUser.id);

            if (error) {
              throw error;
            }

            // Mettre à jour l'état local
            set({
              user: { ...currentUser, ...updates },
              loading: false,
            });

            console.log('Profil mis à jour avec succès');
          } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            set({
              error: 'Erreur lors de la mise à jour du profil',
              loading: false,
            });
            throw error;
          }
        },

        refreshUser: async () => {
          set({ loading: true, error: null });

          try {
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

            if (authError || !authUser) {
              set({
                user: null,
                isAuthenticated: false,
                loading: false,
              });
              return;
            }

            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .maybeSingle();

            if (profileError) {
              throw profileError;
            }

            if (userProfile) {
              set({
                user: userProfile,
                isAuthenticated: true,
                loading: false,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                loading: false,
              });
            }
          } catch (error) {
            console.error('Erreur lors du rafraîchissement du profil:', error);
            set({
              error: 'Erreur lors du rafraîchissement du profil',
              loading: false,
            });
          }
        },

        setLoading: (loading: boolean) => {
          set({ loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        // Getters
        isAdmin: () => {
          const user = get().user;
          return user?.role === 'admin';
        },

        isActiveAdmin: () => {
          const user = get().user;
          return user?.role === 'admin' && user?.active_role === 'admin';
        },

        isActiveUser: () => {
          const user = get().user;
          return user?.active_role === 'user';
        },

        canSwitchToAdmin: () => {
          const user = get().user;
          return user?.role === 'admin';
        },

        getDisplayName: () => {
          const user = get().user;
          if (!user) return '';
          return user.prenom ? `${user.prenom} ${user.nom}` : user.nom;
        },

        getCurrentModeLabel: () => {
          const user = get().user;
          if (!user) return '';
          if (user.active_role === 'admin') return 'Mode admin';
          return 'Mode client';
        },
      };
    },
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Hook personnalisé pour une utilisation plus simple
export const useUser = () => {
  const store = useUserStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading,
    error: store.error,
    isAdmin: store.isAdmin(),
    isActiveAdmin: store.isActiveAdmin(),
    isActiveUser: store.isActiveUser(),
    canSwitchToAdmin: store.canSwitchToAdmin(),
    displayName: store.getDisplayName(),
    currentModeLabel: store.getCurrentModeLabel(),
    setUser: store.setUser,
    clearUser: store.clearUser,
    switchRole: store.switchRole,
    updateProfile: store.updateProfile,
    refreshUser: store.refreshUser,
    setLoading: store.setLoading,
    setError: store.setError,
  };
};