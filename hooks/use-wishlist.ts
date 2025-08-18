import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface WishlistItem {
  wishlist_item_id: string;
  user_id: string;
  product_id: string;
  added_at: string;
  product_name: string;
  product_description: string;
  product_price: number;
  product_promo_price: number | null;
  product_category: string;
  product_images: string[];
  product_slug: string;
  product_stock: number;
  product_active: boolean;
}

const WISHLIST_CACHE_KEY = 'wishlist_cache';
const WISHLIST_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedWishlist(userId: string | null) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`${WISHLIST_CACHE_KEY}_${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.timestamp || !parsed.items) return null;
    if (Date.now() - parsed.timestamp > WISHLIST_CACHE_DURATION) return null;
    return parsed.items as WishlistItem[];
  } catch {
    return null;
  }
}

function setCachedWishlist(userId: string | null, items: WishlistItem[]) {
  if (!userId) return;
  localStorage.setItem(
    `${WISHLIST_CACHE_KEY}_${userId}`,
    JSON.stringify({ items, timestamp: Date.now() })
  );
}

function clearCachedWishlist(userId: string | null) {
  if (!userId) return;
  localStorage.removeItem(`${WISHLIST_CACHE_KEY}_${userId}`);
}

export function useWishlist() {
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Récupérer la wishlist
  const fetchWishlist = useCallback(async (force = false) => {
    if (!isAuthenticated || !user?.id) {
      setWishlistItems([]);
      setWishlistLoading(false);
      return;
    }

    // Lire le cache si pas force
    if (!force) {
      const cached = getCachedWishlist(user.id);
      if (cached) {
        setWishlistItems(cached);
        setWishlistLoading(false);
        return;
      }
    }

    try {
      setWishlistLoading(true);
      const response = await fetch('/api/wishlist');
      
      // Vérifier si la réponse est du JSON valide
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('fetchWishlist: Réponse non-JSON reçue, probablement une page d\'erreur');
        setWishlistItems([]);
        return;
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Utilisateur non authentifié, vider la wishlist
          setWishlistItems([]);
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWishlistItems(data.wishlistItems || []);
      setCachedWishlist(user.id, data.wishlistItems || []);
    } catch (error) {
      console.error('Erreur fetchWishlist:', error);
      // Ne pas afficher d'erreur toast pour éviter le spam
      setWishlistItems([]);
    } finally {
      setWishlistLoading(false);
    }
  }, [isAuthenticated, user?.id, toast]);

  // Ajouter un produit à la wishlist
  const addToWishlist = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      // Rediriger vers la connexion avec l'URL de retour
      const currentPath = window.location.pathname;
      router.push(`/connexion?redirect=${encodeURIComponent(currentPath)}`);
      return { success: false, requiresAuth: true };
    }

    try {
      setLoading(true);
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout à la wishlist');
      }

      if (data.alreadyExists) {
        toast({
          title: "Déjà dans la wishlist",
          description: "Ce produit est déjà dans votre liste de souhaits",
        });
        return { success: true, alreadyExists: true };
      }

      // Rafraîchir la wishlist (force API)
      await fetchWishlist(true);

      toast({
        title: "Ajouté à la wishlist",
        description: "Le produit a été ajouté à votre liste de souhaits",
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur addToWishlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit à la wishlist",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, router, toast, fetchWishlist]);

  // Supprimer un produit de la wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      return { success: false, requiresAuth: true };
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/wishlist?product_id=${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression de la wishlist');
      }

      // Mettre à jour la wishlist localement (sans attendre l'API)
      setWishlistItems(prev => {
        const updated = prev.filter(item => item.product_id !== productId);
        setCachedWishlist(user?.id || null, updated);
        return updated;
      });

      toast({
        title: "Supprimé de la wishlist",
        description: "Le produit a été supprimé de votre liste de souhaits",
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur removeFromWishlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit de la wishlist",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast, user?.id]);

  // Vérifier si un produit est dans la wishlist
  const isInWishlist = useCallback((productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  }, [wishlistItems]);

  // Basculer l'état wishlist d'un produit
  const toggleWishlist = useCallback(async (productId: string) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // Charger la wishlist au montage et quand l'authentification change
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Nettoyer le cache à la déconnexion
  useEffect(() => {
    if (!isAuthenticated && user?.id) {
      clearCachedWishlist(user.id);
      setWishlistItems([]);
    }
  }, [isAuthenticated, user?.id]);

  return {
    wishlistItems,
    loading,
    wishlistLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    fetchWishlist,
    wishlistCount: wishlistItems.length,
  };
} 