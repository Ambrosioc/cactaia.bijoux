"use client"

import AddToCartButton from '@/components/cart/add-to-cart-button';
import OptimizedImage from '@/components/ui/optimized-image';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/supabase/types';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Filter, Heart, Package, Search, Star, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PRODUCTS_PER_PAGE = 12;

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryName, setCategoryName] = useState<string>('');

    const supabase = createClient();

    // Convertir le slug en nom de catégorie
    const getCategoryFromSlug = (slug: string) => {
        const categoryMap: { [key: string]: string } = {
            'bagues': 'Bagues',
            'colliers': 'Colliers',
            'bracelets': 'Bracelets',
            'boucles-d-oreilles': 'Boucles d\'oreilles',
            'accessoires': 'Accessoires'
        };
        return categoryMap[slug] || slug;
    };

    // Charger les produits quand les paramètres changent
    useEffect(() => {
        if (params.slug) {
            const category = getCategoryFromSlug(params.slug as string);
            setCategoryName(category);
            loadProducts(category);
        }
    }, [params.slug, currentPage, sortBy, searchTerm]);

    const loadProducts = async (category: string) => {
        try {
            setLoading(true);
            setError(null);

            // Construire la requête de base
            let query = supabase
                .from('produits')
                .select('*', { count: 'exact' })
                .eq('est_actif', true)
                .eq('categorie', category);

            if (searchTerm) {
                query = query.or(`nom.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
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

    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
                <div className="container-custom py-16">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <X className="h-8 w-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
                        <p className="text-gray-600 mb-8">{error}</p>
                        <Link href="/collections" className="btn bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-lg transition-colors">
                            Retour aux collections
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header avec padding pour éviter la navbar */}
            <div className="pt-24 pb-12 bg-white shadow-sm">
                <div className="container-custom">
                    {/* Breadcrumb et titre */}
                    <div className="flex items-center space-x-4 mb-8">
                        <Link
                            href="/collections"
                            className="flex items-center text-primary hover:text-primary/80 transition-colors group"
                        >
                            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Retour aux collections</span>
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{categoryName}</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Découvrez notre collection exclusive de {categoryName.toLowerCase()}
                            inspirée par la beauté du désert et l&apos;élégance naturelle.
                        </p>
                    </div>

                    {/* Barre de recherche et filtres */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            <div className="flex-1 relative max-w-md w-full">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher dans cette catégorie..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl border transition-all ${showFilters
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    <Filter className="h-4 w-4" />
                                    <span className="text-sm font-medium">Filtres</span>
                                </button>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                >
                                    <option value="newest">Plus récents</option>
                                    <option value="price_asc">Prix croissant</option>
                                    <option value="price_desc">Prix décroissant</option>
                                    <option value="name">Nom A-Z</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="container-custom py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
                            >
                                <div className="h-64 bg-gray-200" />
                                <div className="p-6 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    <div className="h-8 bg-gray-200 rounded" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="h-12 w-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Aucun produit trouvé</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            {searchTerm
                                ? `Aucun produit ne correspond à "${searchTerm}" dans cette catégorie.`
                                : 'Aucun produit disponible dans cette catégorie pour le moment.'
                            }
                        </p>
                        <Link
                            href="/collections"
                            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Voir tous les produits
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Compteur de résultats */}
                        <div className="mb-8 text-center">
                            <p className="text-gray-600">
                                {totalCount} produit{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Grille de produits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <Link href={`/produit/${("slug" in product && product.slug ? product.slug : product.id)}`} className="block">
                                        <div className="relative h-72 overflow-hidden">
                                            <OptimizedImage
                                                src={(product.images && product.images[0]) || '/placeholder.jpg'}
                                                alt={product.nom}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            {product.est_mis_en_avant && (
                                                <div className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                                                    Populaire
                                                </div>
                                            )}
                                            <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                                                <Heart className="h-4 w-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </Link>

                                    <div className="p-6">
                                        <Link href={`/produit/${("slug" in product && product.slug ? product.slug : product.id)}`}>
                                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {product.nom}
                                            </h3>
                                        </Link>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                <span className="text-sm text-gray-600">4.8</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {product.prix_promo ? (
                                                    <>
                                                        <span className="text-lg font-bold text-primary">
                                                            {product.prix_promo.toFixed(2)}€
                                                        </span>
                                                        <span className="text-sm text-gray-500 line-through">
                                                            {product.prix.toFixed(2)}€
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-lg font-bold text-primary">
                                                        {product.prix.toFixed(2)}€
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <AddToCartButton product={product} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-16">
                                <div className="flex items-center space-x-2 bg-white rounded-2xl shadow-sm p-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => {
                                        const page = i + 1;
                                        const isCurrentPage = page === currentPage;
                                        const isNearCurrent = Math.abs(page - currentPage) <= 2;

                                        if (isCurrentPage || isNearCurrent || page === 1 || page === totalPages) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2 rounded-xl transition-colors ${isCurrentPage
                                                        ? 'bg-primary text-white'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (page === 2 && currentPage > 4) {
                                            return <span key={page} className="px-2 text-gray-400">...</span>;
                                        } else if (page === totalPages - 1 && currentPage < totalPages - 3) {
                                            return <span key={page} className="px-2 text-gray-400">...</span>;
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 