import type { Product } from '@/lib/supabase/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariations?: Record<string, string>; // Pour les variations futures
}

interface CartStore {
  // État
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: Product, quantity?: number, variations?: Record<string, string>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemById: (itemId: string) => CartItem | undefined;
  hasItem: (productId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // État initial
      items: [],
      isOpen: false,

      // Actions
      addItem: (product: Product, quantity = 1, variations = {}) => {
        const items = get().items;
        const itemId = `${product.id}-${JSON.stringify(variations)}`;
        
        const existingItem = items.find(item => item.id === itemId);

        if (existingItem) {
          // Mettre à jour la quantité si l'item existe déjà
          set({
            items: items.map(item =>
              item.id === itemId
                ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock ?? 0) }
                : item
            )
          });
        } else {
          // Ajouter un nouvel item
          const newItem: CartItem = {
            id: itemId,
            product,
            quantity: Math.min(quantity, product.stock ?? 0),
            selectedVariations: variations,
          };

          set({
            items: [...items, newItem]
          });
        }
      },

      removeItem: (itemId: string) => {
        set({
          items: get().items.filter(item => item.id !== itemId)
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set({
          items: get().items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                quantity: Math.min(quantity, item.product.stock ?? 0)
              };
            }
            return item;
          })
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      // Getters
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.prix_promo && item.product.prix_promo < item.product.prix
            ? item.product.prix_promo
            : item.product.prix;
          return total + (price * item.quantity);
        }, 0);
      },

      getItemById: (itemId: string) => {
        return get().items.find(item => item.id === itemId);
      },

      hasItem: (productId: string) => {
        return get().items.some(item => item.product.id === productId);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }), // Persister seulement les items
    }
  )
);

// Hook personnalisé pour une utilisation plus simple
export const useCart = () => {
  const store = useCartStore();
  return {
    items: store.items,
    isOpen: store.isOpen,
    totalItems: store.getTotalItems(),
    totalPrice: store.getTotalPrice(),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    openCart: store.openCart,
    closeCart: store.closeCart,
    toggleCart: store.toggleCart,
    getItemById: store.getItemById,
    hasItem: store.hasItem,
  };
};