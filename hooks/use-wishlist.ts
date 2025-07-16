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

export function useWishlist() {
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Récupérer la wishlist
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistLoading(false);
      return;
    }

    try {
      setWishlistLoading(true);
      const response = await fetch('/api/wishlist');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la wishlist');
      }

      const data = await response.json();
      setWishlistItems(data.wishlistItems || []);
    } catch (error) {
      console.error('Erreur fetchWishlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer votre liste de souhaits",
        variant: "destructive",
      });
    } finally {
      setWishlistLoading(false);
    }
  }, [isAuthenticated, toast]);

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

      // Rafraîchir la wishlist
      await fetchWishlist();

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

      // Mettre à jour la wishlist localement
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));

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
  }, [isAuthenticated, toast]);

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