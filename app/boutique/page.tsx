"use client"

import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/supabase/types';
import { motion } from 'framer-motion';
import { Heart, Package, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('est_actif', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let result = [...products];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(product =>
        product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.categorie === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "price_asc":
        result.sort((a, b) => (a.prix_promo || a.prix) - (b.prix_promo || b.prix));
        break;
      case "price_desc":
        result.sort((a, b) => (b.prix_promo || b.prix) - (a.prix_promo || a.prix));
        break;
      case "name":
        result.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
  };

  const getImageUrl = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/placeholder.jpg'; // Image par défaut
  };

  const getPrice = (product: Product) => {
    const hasPromo = product.prix_promo && product.prix_promo < product.prix;
    return {
      current: hasPromo ? product.prix_promo : product.prix,
      original: product.prix,
      hasPromo
    };
  };

  const allCategories = [...new Set(products.map(product => product.categorie))];

  // Skeleton loader component
  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-md mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-16">
      {/* Hero Banner */}
      <section className="relative h-[30vh] min-h-[200px] mb-8">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg"
            alt="Boutique Cactaia"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative h-full container-custom flex items-center">
          <div>
            <h1 className="heading-xl text-white mb-2">Boutique</h1>
            <p className="text-white/80 max-w-xl">
              Découvrez notre collection de bijoux écoresponsables et élégants
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom">
        {/* Mobile filters toggle */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <button
            className="btn btn-outline flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
          </button>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="newest">Nouveautés</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters
            ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto'
            : 'hidden md:block'
            }`}>
            {showFilters && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Filtres</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 rounded-full hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="space-y-6">
              {/* Search */}
              <div>
                <h3 className="text-lg font-medium mb-3">Recherche</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-medium mb-3">Catégories</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary"
                    />
                    Toutes les catégories
                  </label>
                  {allCategories.map(category => (
                    <label
                      key={category}
                      className="flex items-center"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="mr-2 h-4 w-4 text-primary focus:ring-primary"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="w-full btn btn-outline py-2"
              >
                Réinitialiser les filtres
              </button>
            </div>

            {/* Mobile filter close button */}
            {showFilters && (
              <div className="mt-6">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full btn btn-primary py-2"
                >
                  Voir {filteredProducts.length} produits
                </button>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {/* Desktop Sort */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                {loading ? 'Chargement...' : `${filteredProducts.length} produits`}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Trier par:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="newest">Nouveautés</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="name">Nom A-Z</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <h3 className="text-xl font-medium mb-2 text-red-700">Erreur de chargement</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <button
                  onClick={loadProducts}
                  className="btn btn-primary px-6 py-2"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || selectedCategory !== 'all'
                    ? 'Aucun produit ne correspond à vos critères de recherche.'
                    : 'Aucun produit disponible pour le moment.'
                  }
                </p>
                {(searchTerm || selectedCategory !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="btn btn-primary px-6 py-2"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product, i) => {
                  const price = getPrice(product);

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="group"
                    >
                      <Link href={`/produit/${product.sku || product.id}`}>
                        <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-secondary/30">
                          {/* Badges */}
                          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                            {product.est_mis_en_avant && (
                              <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                Featured
                              </div>
                            )}
                            {price.hasPromo && (
                              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                                Promo
                              </div>
                            )}
                          </div>

                          {/* Wishlist button */}
                          <button
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
                            aria-label="Ajouter aux favoris"
                            onClick={(e) => {
                              e.preventDefault();
                              // Add to wishlist logic would go here
                            }}
                          >
                            <Heart className="h-4 w-4" />
                          </button>

                          {/* Product Image */}
                          <Image
                            src={getImageUrl(product)}
                            alt={product.nom}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.jpg';
                            }}
                          />
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">{product.categorie}</p>
                          <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                            {product.nom}
                          </h3>

                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-lg">
                              {price?.current?.toFixed(2)}€
                            </span>
                            {price.hasPromo && (
                              <span className="text-sm text-muted-foreground line-through">
                                {price.original.toFixed(2)}€
                              </span>
                            )}
                          </div>

                          {/* Short description */}
                          {product.description_courte && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {product.description_courte}
                            </p>
                          )}

                          {/* Stock indicator */}
                          {product.stock === 0 && (
                            <p className="text-sm text-red-600 font-medium">
                              Rupture de stock
                            </p>
                          )}
                          {product.stock > 0 && product.stock <= 5 && (
                            <p className="text-sm text-orange-600">
                              Plus que {product.stock} en stock
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}