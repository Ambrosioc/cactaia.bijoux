import {
  getCachedFeaturedProducts,
  getCachedProducts,
  preloadProducts,
  setCachedFeaturedProducts,
  setCachedProducts
} from '@/lib/cache/product-cache';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/supabase/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseProductsOptimizedProps {
  category?: string;
  collection?: string;
  searchTerm?: string;
  sortBy?: string;
  page?: number;
  itemsPerPage?: number;
  featured?: boolean;
}

interface UseProductsOptimizedReturn {
  products: Product[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useProductsOptimized({
  category = 'all',
  collection,
  searchTerm = '',
  sortBy = 'newest',
  page = 1,
  itemsPerPage = 12,
  featured = false
}: UseProductsOptimizedProps = {}): UseProductsOptimizedReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  
  const supabase = createClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Debounce search term pour éviter trop de requêtes
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Créer les filtres pour le cache
  const normalizedCategory = category === 'all' ? undefined : category?.replace(/['’]/g, "'");
  const normalizedCategorySearch = normalizedCategory
    ? normalizedCategory.replace(/[%_]/g, '\\$&')
    : undefined;
  const filters = useMemo(() => ({
    category: normalizedCategory,
    collection,
    searchTerm: debouncedSearchTerm,
    sortBy,
    page: currentPage
  }), [normalizedCategory, collection, debouncedSearchTerm, sortBy, currentPage]);

  const fetchProducts = useCallback(async (force = false) => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache d'abord (sauf si force = true)
      if (!force) {
        if (featured) {
          const cached = getCachedFeaturedProducts();
          if (cached) {
            setProducts(cached);
            // Pour les "featured", le total n'a pas de sens (liste limitée)
            setTotalCount(cached.length);
            setLoading(false);
            return;
          }
        } else {
          const cached = getCachedProducts(filters);
          if (cached) {
            // Calculer le total via une requête dédiée pour éviter les incohérences
            let countQuery = supabase
              .from('produits')
              .select('*', { count: 'exact', head: true })
              .or('est_actif.is.true,est_actif.is.null');

            if (normalizedCategorySearch) {
              countQuery = countQuery.ilike('categorie', `%${normalizedCategorySearch}%`);
            }

            if (collection) {
              countQuery = countQuery.contains('collections', [collection]);
            }

            if (debouncedSearchTerm) {
              countQuery = countQuery.or(`nom.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`);
            }

            const { count: totalC } = await countQuery;
            setProducts(cached);
            setTotalCount(typeof totalC === 'number' ? totalC : cached.length);
            setLoading(false);
            return;
          }
        }
      }

      // Construire la requête de base
      let query = supabase
        .from('produits')
        .select('*')
        .or('est_actif.is.true,est_actif.is.null');

      // Appliquer les filtres
      if (normalizedCategorySearch) {
        // Filtre robuste aux apostrophes, accents, espaces et variations de casse
        query = query.ilike('categorie', `%${normalizedCategorySearch}%`);
      }

      if (collection) {
        query = query.contains('collections', [collection]);
      }

      if (featured) {
        query = query.or('est_mis_en_avant.eq.true');
      }

      if (debouncedSearchTerm) {
        query = query.or(`nom.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`);
      }

      // Appliquer le tri
      switch (sortBy) {
        case "newest":
          query = query.order('created_at', { ascending: false });
          break;
        case "price_asc":
          query = query.order('prix', { ascending: true });
          break;
        case "price_desc":
          query = query.order('prix', { ascending: false });
          break;
        case "name":
          query = query.order('nom', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Calculer le total séparément (plus fiable selon les versions et filtres)
      let computedTotalCount: number | null = null;
      if (!featured) {
        let countQuery = supabase
          .from('produits')
          .select('*', { count: 'exact', head: true })
          .or('est_actif.is.true,est_actif.is.null');

        if (normalizedCategorySearch) {
          countQuery = countQuery.ilike('categorie', `%${normalizedCategorySearch}%`);
        }

        if (collection) {
          countQuery = countQuery.contains('collections', [collection]);
        }

        if (debouncedSearchTerm) {
          countQuery = countQuery.or(`nom.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`);
        }

        const { count: totalC, error: countError } = await countQuery;
        if (!countError && typeof totalC === 'number') {
          computedTotalCount = totalC;
        }
      }

      // Appliquer la pagination (sauf pour les produits mis en avant)
      if (!featured) {
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);
      } else {
        query = query.limit(6);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const productsData = data || [];
      setProducts(productsData);
      setTotalCount(computedTotalCount ?? productsData.length ?? 0);

      // Mettre en cache
      if (featured) {
        setCachedFeaturedProducts(productsData);
      } else {
        setCachedProducts(filters, productsData);
        
        // Précharger la page suivante en arrière-plan
        if (productsData.length > 0) {
          preloadProducts({ ...filters, page: currentPage + 1 });
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Requête annulée, ne rien faire
        return;
      }
      
      console.error('Erreur lors du chargement des produits:', error);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, [collection, debouncedSearchTerm, sortBy, currentPage, itemsPerPage, featured, supabase, normalizedCategorySearch, filters]);

  // Charger les produits quand les paramètres changent
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Nettoyer l'abort controller
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(async () => {
    await fetchProducts(true);
  }, [fetchProducts]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  return {
    products,
    totalCount,
    loading,
    error,
    refetch,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage
  };
} 