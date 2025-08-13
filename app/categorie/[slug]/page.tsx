"use client"

import AddToCartButton from '@/components/cart/add-to-cart-button';
import OptimizedImage from '@/components/ui/optimized-image';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { useProductsOptimized } from '@/lib/hooks/use-products-optimized';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Filter, Package, Search, Star, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PRODUCTS_PER_PAGE = 12;

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryName, setCategoryName] = useState<string>('');

    // Convertir le slug en nom de catégorie
    const getCategoryFromSlug = (slug: string) => {
        const categoryMap: { [key: string]: string } = {
            'bagues': 'Bagues',
            'colliers': 'Colliers',
            'bracelets': 'Bracelets',
            'boucles-d-oreilles': 'Boucles d\'oreilles',
            'accessoires': 'Accessoires'
        };
        // Normaliser: première lettre en majuscule, gérer apostrophes typographiques
        const label = categoryMap[slug] || slug;
        return label.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/’/g, "'");
    };

    // Utiliser le hook optimisé
    const {
        products,
        totalCount,
        loading,
        error,
        hasNextPage,
        hasPreviousPage,
        goToNextPage,
        goToPreviousPage
    } = useProductsOptimized({
        category: params.slug ? getCategoryFromSlug(params.slug as string) : undefined,
        searchTerm,
        sortBy,
        page: currentPage,
        itemsPerPage: PRODUCTS_PER_PAGE
    });

    // Mettre à jour le nom de la catégorie quand les paramètres changent
    useEffect(() => {
        if (params.slug) {
            const category = getCategoryFromSlug(params.slug as string);
            setCategoryName(category);
        }
    }, [params.slug]);

    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        // Scroll vers le haut de la page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSortChange = (newSortBy: string) => {
        setSortBy(newSortBy);
        setCurrentPage(1); // Retour à la première page
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Retour à la première page
    };

    if (error) {
        return (
            <div className="container-custom py-12">
                <div className="text-center">
                    <h1 className="heading-lg mb-4">Erreur</h1>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header de la catégorie */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border-b">
                <div className="container-custom py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="heading-lg mb-2">{categoryName}</h1>
                            <p className="text-muted-foreground">
                                {totalCount} produit{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-border hover:bg-accent transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filtres</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            {showFilters && (
                <div className="border-b bg-white">
                    <div className="container-custom py-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="newest">Plus récents</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix décroissant</option>
                                <option value="name">Nom A-Z</option>
                            </select>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2 hover:bg-accent rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Liste des produits */}
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
                    <div className="text-center py-12">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
                        <p className="text-muted-foreground mb-6">
                            Aucun produit ne correspond à vos critères de recherche.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSortBy('newest');
                                setCurrentPage(1);
                            }}
                            className="btn-primary"
                        >
                            Voir tous les produits
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.map((product, i) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <Link href={`/produit/${("slug" in product && product.slug ? product.slug : product.id)}`}>
                                        <div className="relative aspect-square overflow-hidden">
                                            {product.est_mis_en_avant && (
                                                <div className="absolute top-2 left-2 z-10 bg-primary text-white text-xs px-2 py-1 rounded">
                                                    Populaire
                                                </div>
                                            )}
                                            {product.created_at && new Date(product.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                                                <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                    Nouveau
                                                </div>
                                            )}
                                            <WishlistButton
                                                productId={product.id}
                                                size="sm"
                                                variant="ghost"
                                                className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                                            />
                                            <OptimizedImage
                                                src={(product.images && product.images[0]) || '/placeholder.jpg'}
                                                alt={product.nom}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                            />
                                        </div>
                                        <div className="p-6 space-y-2">
                                            <p className="text-sm text-muted-foreground">{product.categorie}</p>
                                            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                                {product.nom}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm text-muted-foreground">4.8</span>
                                                </div>
                                                <p className="font-medium">
                                                    {product.prix_promo ? (
                                                        <span className="text-primary">{product.prix_promo.toFixed(2)}€</span>
                                                    ) : (
                                                        `${product.prix.toFixed(2)}€`
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="px-6 pb-6">
                                        <AddToCartButton
                                            product={product}
                                            className="w-full"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-12">
                                <button
                                    onClick={() => goToPreviousPage()}
                                    disabled={!hasPreviousPage}
                                    className="p-2 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-2 rounded-lg transition-colors ${currentPage === page
                                                    ? 'bg-primary text-white'
                                                    : 'border border-border hover:bg-accent'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => goToNextPage()}
                                    disabled={!hasNextPage}
                                    className="p-2 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 