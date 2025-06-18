'use client';

import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/supabase/types';
import { useCallback, useEffect, useState } from 'react';

interface UseProductsProps {
  category?: string;
  searchTerm?: string;
  sortBy?: string;
  page?: number;
  itemsPerPage?: number;
}

interface UseProductsReturn {
  products: Product[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts({
  category = 'all',
  searchTerm = '',
  sortBy = 'newest',
  page = 1,
  itemsPerPage = 15
}: UseProductsProps = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construire la requête de base
      let query = supabase
        .from('produits')
        .select('*', { count: 'exact' })
        .eq('est_actif', true);

      // Appliquer les filtres
      if (category !== 'all') {
        query = query.eq('categorie', category);
      }

      if (searchTerm) {
        query = query.or(`nom.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,categorie.ilike.%${searchTerm}%`);
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

      // Appliquer la pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, [category, searchTerm, sortBy, page, itemsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    totalCount,
    loading,
    error,
    refetch: fetchProducts
  };
}

export async function getCategories() {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('produits')
      .select('categorie')
      .eq('est_actif', true);

    if (error) throw error;

    return [...new Set(data?.map(item => item.categorie) || [])];
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error);
    return [];
  }
}