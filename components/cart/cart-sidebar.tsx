'use client';

import OptimizedImage from '@/components/ui/optimized-image';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/stores/cartStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import Link from 'next/link';

export default function CartSidebar() {
    const {
        items,
        isOpen,
        totalItems,
        totalPrice,
        updateQuantity,
        removeItem,
        closeCart
    } = useCart();

    const getImageUrl = (images: string[]): string => {
        return images?.length > 0 ? images[0] : '/placeholder.jpg';
    };

    const getPrice = (product: any) => {
        return product.prix_promo && product.prix_promo < product.prix
            ? product.prix_promo
            : product.prix;
    };

    const shipping = totalPrice >= 50 ? 0 : 4.95;
    const total = totalPrice + shipping;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/50 z-50"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-lg font-medium">
                                Panier ({totalItems} {totalItems > 1 ? 'articles' : 'article'})
                            </h2>
                            <button
                                onClick={closeCart}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                    <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Votre panier est vide</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Découvrez nos bijoux et ajoutez-les à votre panier
                                    </p>
                                    <Link
                                        href="/collections"
                                        onClick={closeCart}
                                        className="btn btn-primary px-6 py-2"
                                    >
                                        Découvrir nos produits
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-6 space-y-4">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                                        >
                                            {/* Image */}
                                            <div className="relative w-16 h-16 flex-shrink-0">
                                                <OptimizedImage
                                                    src={getImageUrl(item.product.images ?? [])}
                                                    alt={item.product.nom}
                                                    fill
                                                    className="object-cover rounded-md"
                                                    sizes="64px"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">
                                                    {item.product.nom}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.product.categorie}
                                                </p>
                                                <p className="font-medium text-sm">
                                                    {formatPrice(getPrice(item.product))}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-sm font-medium w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                    disabled={item.quantity >= (item.product.stock ?? 0)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-border p-6 space-y-4">
                                {/* Shipping info */}
                                {totalPrice < 50 && (
                                    <div className="text-xs text-center p-2 bg-blue-50 text-blue-700 rounded">
                                        💡 Plus que {formatPrice(50 - totalPrice)} pour la livraison gratuite !
                                    </div>
                                )}

                                {totalPrice >= 50 && (
                                    <div className="text-xs text-center p-2 bg-green-50 text-green-700 rounded">
                                        🎉 Livraison gratuite !
                                    </div>
                                )}

                                {/* Subtotal */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Sous-total</span>
                                        <span>{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Livraison</span>
                                        <span>{shipping === 0 ? 'Gratuite' : formatPrice(shipping)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-medium pt-2 border-t border-border">
                                        <span>Total</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <Link
                                        href="/checkout"
                                        onClick={closeCart}
                                        className="w-full btn btn-primary py-3 text-center block flex items-center justify-center gap-2"
                                    >
                                        Passer commande
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/panier"
                                        onClick={closeCart}
                                        className="w-full btn btn-outline py-2 text-center block"
                                    >
                                        Voir le panier
                                    </Link>
                                </div>

                                {/* Security info */}
                                <p className="text-xs text-muted-foreground text-center">
                                    🔒 Paiement sécurisé avec Stripe
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}