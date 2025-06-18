"use client"

import AddToCartButton from '@/components/cart/add-to-cart-button';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/supabase/types';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Package, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const PRODUCTS_PER_PAGE = 15;

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const supabase = createClient();

  // Charger les catégories disponibles
  useEffect(() => {
    loadCategories();
  }, []);

  // Charger les produits quand les filtres changent
  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory, sortBy, searchTerm]);

  // Remettre à la page 1 quand les filtres changent
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedCategory, sortBy, searchTerm]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('produits')
        .select('categorie')
        .eq('est_actif', true);

      if (error) throw error;

      const uniqueCategories = [...new Set(data?.map(item => item.categorie) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construire la requête de base
      let query = supabase
        .from('produits')
        .select('*', { count: 'exact' })
        .eq('est_actif', true);

      // Appliquer les filtres
      if (selectedCategory !== 'all') {
        query = query.eq('categorie', selectedCategory);
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
      const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;
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
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const getImageUrl = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/placeholder.jpg';
  };

  const getPrice = (product: Product) => {
    const hasPromo = product.prix_promo && product.prix_promo < product.prix;
    return {
      current: hasPromo ? product.prix_promo : product.prix,
      original: product.prix,
      hasPromo
    };
  };

  // Calcul de la pagination
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
          {/* Filters Sidebar - Sticky */}
          <div className={`${showFilters
            ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto'
            : 'hidden md:block'
            }`}>
            <div className="md:sticky md:top-24 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto">
              {showFilters && (
                <div className="flex justify-between items-center mb-4 md:hidden">
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
                    {categories.map(category => (
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
                <div className="mt-6 md:hidden">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full btn btn-primary py-2"
                  >
                    Voir {totalCount} produits
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {/* Desktop Sort */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                {loading ? 'Chargement...' : `${totalCount} produits`}
                {totalCount > 0 && (
                  <span className="ml-2">
                    (page {currentPage} sur {totalPages})
                  </span>
                )}
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
                {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
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
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product, i) => {
                    const price = getPrice(product);

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
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

                        {/* Add to Cart Button */}
                        <div className="mt-3" onClick={(e) => e.preventDefault()}>
                          <AddToCartButton
                            product={product}
                            className="w-full py-2 text-sm"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center space-x-2">
                      {/* Bouton Précédent */}
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!hasPrevPage || loading}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Précédent
                      </button>

                      {/* Numéros de pages */}
                      <div className="flex space-x-1">
                        {getPageNumbers().map((page, index) => (
                          <button
                            key={index}
                            onClick={() => typeof page === 'number' && setCurrentPage(page)}
                            disabled={page === '...' || loading}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${page === currentPage
                              ? 'bg-primary text-white'
                              : page === '...'
                                ? 'text-gray-400 cursor-default'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      {/* Bouton Suivant */}
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!hasNextPage || loading}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Informations de pagination */}
                {totalCount > 0 && (
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Affichage de {((currentPage - 1) * PRODUCTS_PER_PAGE) + 1} à{' '}
                    {Math.min(currentPage * PRODUCTS_PER_PAGE, totalCount)} sur {totalCount} produits
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}