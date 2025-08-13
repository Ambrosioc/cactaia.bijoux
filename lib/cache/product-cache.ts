import type { Product } from '@/lib/supabase/types';

const PRODUCT_CACHE_KEY = 'product_cache';
const PRODUCT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const FEATURED_PRODUCTS_CACHE_KEY = 'featured_products_cache';
const FEATURED_PRODUCTS_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

interface CachedData<T> {
  data: T;
  timestamp: number;
  version: string;
}

const CACHE_VERSION = '1.0.2';

// Fonctions utilitaires pour le cache
function getCachedData<T>(key: string, duration: number): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    const cached: CachedData<T> = JSON.parse(raw);
    
    // Vérifier la version du cache
    if (cached.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }
    
    // Vérifier l'expiration
    if (Date.now() - cached.timestamp > duration) {
      localStorage.removeItem(key);
      return null;
    }
    
    return cached.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.warn('Erreur lors de la mise en cache:', error);
  }
}

function clearCache(key?: string): void {
  if (typeof window === 'undefined') return;
  
  if (key) {
    localStorage.removeItem(key);
  } else {
    // Nettoyer tous les caches de produits
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith(PRODUCT_CACHE_KEY) || k.startsWith(FEATURED_PRODUCTS_CACHE_KEY)) {
        localStorage.removeItem(k);
      }
    });
  }
}

// Cache pour les produits par catégorie/collection
export function getCachedProducts(filters: {
  category?: string;
  collection?: string;
  searchTerm?: string;
  sortBy?: string;
  page?: number;
}): Product[] | null {
  const cacheKey = `${PRODUCT_CACHE_KEY}_${JSON.stringify(filters)}`;
  return getCachedData<Product[]>(cacheKey, PRODUCT_CACHE_DURATION);
}

export function setCachedProducts(
  filters: {
    category?: string;
    collection?: string;
    searchTerm?: string;
    sortBy?: string;
    page?: number;
  },
  products: Product[]
): void {
  const cacheKey = `${PRODUCT_CACHE_KEY}_${JSON.stringify(filters)}`;
  setCachedData(cacheKey, products);
}

// Cache pour les produits mis en avant
export function getCachedFeaturedProducts(): Product[] | null {
  return getCachedData<Product[]>(FEATURED_PRODUCTS_CACHE_KEY, FEATURED_PRODUCTS_CACHE_DURATION);
}

export function setCachedFeaturedProducts(products: Product[]): void {
  setCachedData(FEATURED_PRODUCTS_CACHE_KEY, products);
}

// Cache pour un produit individuel
export function getCachedProduct(productId: string): Product | null {
  const cacheKey = `${PRODUCT_CACHE_KEY}_product_${productId}`;
  return getCachedData<Product>(cacheKey, PRODUCT_CACHE_DURATION);
}

export function setCachedProduct(productId: string, product: Product): void {
  const cacheKey = `${PRODUCT_CACHE_KEY}_product_${productId}`;
  setCachedData(cacheKey, product);
}

// Nettoyage du cache
export function clearProductCache(productId?: string): void {
  if (productId) {
    const cacheKey = `${PRODUCT_CACHE_KEY}_product_${productId}`;
    clearCache(cacheKey);
  } else {
    clearCache();
  }
}

// Préchargement intelligent
export function preloadProducts(filters: {
  category?: string;
  collection?: string;
  searchTerm?: string;
  sortBy?: string;
  page?: number;
}): void {
  // Précharger la page suivante en arrière-plan
  const nextPageFilters = { ...filters, page: (filters.page || 1) + 1 };
  const cacheKey = `${PRODUCT_CACHE_KEY}_${JSON.stringify(nextPageFilters)}`;
  
  // Vérifier si la page suivante n'est pas déjà en cache
  if (!getCachedData<Product[]>(cacheKey, PRODUCT_CACHE_DURATION)) {
    // Marquer pour préchargement (sera géré par le hook)
    if (typeof window !== 'undefined') {
      window.requestIdleCallback?.(() => {
        // Le préchargement sera géré par le hook useProducts
      });
    }
  }
}

// Statistiques du cache
export function getCacheStats(): {
  totalItems: number;
  totalSize: number;
  hitRate: number;
} {
  if (typeof window === 'undefined') {
    return { totalItems: 0, totalSize: 0, hitRate: 0 };
  }
  
  const keys = Object.keys(localStorage);
  const productKeys = keys.filter(k => 
    k.startsWith(PRODUCT_CACHE_KEY) || k.startsWith(FEATURED_PRODUCTS_CACHE_KEY)
  );
  
  let totalSize = 0;
  productKeys.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    } catch {
      // Ignorer les erreurs
    }
  });
  
  return {
    totalItems: productKeys.length,
    totalSize,
    hitRate: 0 // À implémenter avec un système de tracking
  };
} 