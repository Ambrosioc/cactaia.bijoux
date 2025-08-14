"use client"

import AddToCartButton from '@/components/cart/add-to-cart-button';
import OptimizedImage from '@/components/ui/optimized-image';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { useProductsOptimized } from '@/lib/hooks/use-products-optimized';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const FeaturedProductsOptimized = () => {
    const [startIndex, setStartIndex] = useState(0);
    const visibleProducts = 3;

    const { products, loading, error } = useProductsOptimized({
        featured: true,
        itemsPerPage: 6
    });

    const nextProducts = () => {
        setStartIndex((prevIndex) =>
            (prevIndex + 1) % Math.max(1, products.length - visibleProducts + 1)
        );
    };

    const prevProducts = () => {
        setStartIndex((prevIndex) =>
            prevIndex === 0 ? Math.max(0, products.length - visibleProducts) : prevIndex - 1
        );
    };

    const displayProducts = products.slice(startIndex, startIndex + visibleProducts);

    if (loading) {
        return (
            <section className="py-20">
                <div className="container-custom">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="heading-lg">Nos produits phares</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="animate-pulse"
                            >
                                <div className="aspect-square bg-gray-200 rounded-md mb-4" />
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    <div className="h-6 bg-gray-200 rounded" />
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-20">
                <div className="container-custom">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Erreur lors du chargement des produits phares.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20">
            <div className="container-custom">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="heading-lg">Nos produits phares</h2>
                    {products.length > visibleProducts && (
                        <div className="flex space-x-2">
                            <button
                                onClick={prevProducts}
                                className="p-2 rounded-full border border-border hover:bg-accent transition-colors"
                                aria-label="Produits précédents"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={nextProducts}
                                className="p-2 rounded-full border border-border hover:bg-accent transition-colors"
                                aria-label="Produits suivants"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Aucun produit phare disponible pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {displayProducts.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="group"
                            >
                                <Link href={`/produit/${("slug" in product && product.slug ? product.slug : product.id)}`}>
                                    <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-secondary/30">
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
                                            context="product"
                                            variant="main"
                                            responsive={true}
                                            priority={i < 2} // Priorité pour les 2 premiers produits
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">{product.categorie}</p>
                                        <h3 className="font-medium line-clamp-2">{product.nom}</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                <span className="text-sm text-muted-foreground">
                                                    {(product as any).avgRating ? (product as any).avgRating.toFixed(1) : '4.8'}
                                                </span>
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
                                <div className="mt-4">
                                    <AddToCartButton
                                        product={product}
                                        className="w-full"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProductsOptimized; 