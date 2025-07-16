import { createClient } from '@/lib/supabase/client';
import type { Address, AddressInsert, AddressUpdate } from '@/lib/supabase/types';
import { create } from 'zustand';

const ADDRESS_CACHE_KEY = 'address_cache';
const ADDRESS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedAddresses(userId: string) {
  try {
    const raw = localStorage.getItem(`${ADDRESS_CACHE_KEY}_${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.timestamp || !parsed.addresses) return null;
    if (Date.now() - parsed.timestamp > ADDRESS_CACHE_DURATION) return null;
    return parsed.addresses as Address[];
  } catch {
    return null;
  }
}

function setCachedAddresses(userId: string, addresses: Address[]) {
  localStorage.setItem(
    `${ADDRESS_CACHE_KEY}_${userId}`,
    JSON.stringify({ addresses, timestamp: Date.now() })
  );
}

function clearCachedAddresses(userId: string) {
  localStorage.removeItem(`${ADDRESS_CACHE_KEY}_${userId}`);
}

interface AddressStore {
  // État
  addresses: Address[];
  loading: boolean;
  error: string | null;

  // Actions
  loadAddresses: (userId: string, force?: boolean) => Promise<void>;
  addAddress: (address: AddressInsert) => Promise<void>;
  updateAddress: (id: string, updates: AddressUpdate) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setPrimaryAddress: (id: string) => Promise<void>;
  clearAddresses: (userId?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Getters
  getPrimaryAddress: () => Address | null;
  getAddressById: (id: string) => Address | null;
  hasAddresses: () => boolean;
}

export const useAddressStore = create<AddressStore>((set, get) => {
  const supabase = createClient();

  return {
    // État initial
    addresses: [],
    loading: false,
    error: null,

    // Actions
    loadAddresses: async (userId: string, force = false) => {
      set({ loading: true, error: null });

      // Lire le cache si pas force
      if (!force) {
        const cached = getCachedAddresses(userId);
        if (cached) {
          set({ addresses: cached, loading: false });
          return;
        }
      }

      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', userId)
          .order('est_principale', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        set({
          addresses: data || [],
          loading: false,
        });
        setCachedAddresses(userId, data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des adresses:', error);
        set({
          error: 'Erreur lors du chargement des adresses',
          loading: false,
        });
        throw error;
      }
    },

    addAddress: async (address: AddressInsert) => {
      set({ loading: true, error: null });

      try {
        const { data, error } = await supabase
          .from('addresses')
          .insert(address)
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Ajouter la nouvelle adresse à l'état local
        set(state => {
          const updated = [data, ...state.addresses];
          setCachedAddresses(address.user_id, updated);
          return { addresses: updated, loading: false };
        });

        // Recharger pour s'assurer que l'ordre est correct
        await get().loadAddresses(address.user_id, true);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'adresse:', error);
        set({
          error: 'Erreur lors de l\'ajout de l\'adresse',
          loading: false,
        });
        throw error;
      }
    },

    updateAddress: async (id: string, updates: AddressUpdate) => {
      set({ loading: true, error: null });

      try {
        const { data, error } = await supabase
          .from('addresses')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Mettre à jour l'adresse dans l'état local
        set(state => {
          const updated = state.addresses.map(addr => 
            addr.id === id ? data : addr
          );
          setCachedAddresses(data.user_id, updated);
          return { addresses: updated, loading: false };
        });

        // Si on a changé l'adresse principale, recharger pour mettre à jour l'ordre
        if (updates.est_principale !== undefined) {
          const address = get().addresses.find(addr => addr.id === id);
          if (address) {
            await get().loadAddresses(address.user_id, true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'adresse:', error);
        set({
          error: 'Erreur lors de la mise à jour de l\'adresse',
          loading: false,
        });
        throw error;
      }
    },

    deleteAddress: async (id: string) => {
      set({ loading: true, error: null });

      try {
        const address = get().addresses.find(addr => addr.id === id);
        const { error } = await supabase
          .from('addresses')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        // Supprimer l'adresse de l'état local
        set(state => {
          const updated = state.addresses.filter(addr => addr.id !== id);
          if (address) setCachedAddresses(address.user_id, updated);
          return { addresses: updated, loading: false };
        });
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'adresse:', error);
        set({
          error: 'Erreur lors de la suppression de l\'adresse',
          loading: false,
        });
        throw error;
      }
    },

    setPrimaryAddress: async (id: string) => {
      set({ loading: true, error: null });

      try {
        const { error } = await supabase
          .from('addresses')
          .update({ est_principale: true })
          .eq('id', id);

        if (error) {
          throw error;
        }

        // Mettre à jour l'état local
        set(state => {
          const updated = state.addresses.map(addr => ({
            ...addr,
            est_principale: addr.id === id
          }));
          const address = updated.find(addr => addr.id === id);
          if (address) setCachedAddresses(address.user_id, updated);
          return { addresses: updated, loading: false };
        });

        // Recharger pour s'assurer que l'ordre est correct
        const address = get().addresses.find(addr => addr.id === id);
        if (address) {
          await get().loadAddresses(address.user_id, true);
        }
      } catch (error) {
        console.error('Erreur lors de la définition de l\'adresse principale:', error);
        set({
          error: 'Erreur lors de la définition de l\'adresse principale',
          loading: false,
        });
        throw error;
      }
    },

    clearAddresses: (userId?: string) => {
      set({ addresses: [] });
      if (userId) clearCachedAddresses(userId);
    },

    setLoading: (loading: boolean) => {
      set({ loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    // Getters
    getPrimaryAddress: () => {
      const addresses = get().addresses;
      return addresses.find(addr => addr.est_principale) || null;
    },

    getAddressById: (id: string) => {
      return get().addresses.find(addr => addr.id === id) || null;
    },

    hasAddresses: () => {
      return get().addresses.length > 0;
    },
  };
});

export const useAddresses = () => {
  const store = useAddressStore();
  return {
    addresses: store.addresses,
    loading: store.loading,
    error: store.error,
    loadAddresses: store.loadAddresses,
    addAddress: store.addAddress,
    updateAddress: store.updateAddress,
    deleteAddress: store.deleteAddress,
    setPrimaryAddress: store.setPrimaryAddress,
    clearAddresses: store.clearAddresses,
    getPrimaryAddress: store.getPrimaryAddress,
    getAddressById: store.getAddressById,
    hasAddresses: store.hasAddresses,
  };
};