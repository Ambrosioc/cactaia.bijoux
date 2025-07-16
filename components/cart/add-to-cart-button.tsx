'use client';

import type { Product } from '@/lib/supabase/types';
import { useCart } from '@/stores/cartStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface AddToCartButtonProps {
    product: Product;
    quantity?: number;
    variations?: Record<string, string>;
    className?: string;
    disabled?: boolean;
    showQuantity?: boolean;
}

export default function AddToCartButton({
    product,
    quantity = 1,
    variations = {},
    className = '',
    disabled = false,
    showQuantity = false
}: AddToCartButtonProps) {
    const { addItem, openCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [currentQuantity, setCurrentQuantity] = useState(quantity);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToCart = async () => {
        if (product.stock === 0 || disabled || isLoading) return;

        setIsLoading(true);

        // Simulation d'un délai pour l'animation
        await new Promise(resolve => setTimeout(resolve, 300));

        addItem(product, currentQuantity, variations);
        setIsAdded(true);

        // Ouvrir le panier après un court délai
        setTimeout(() => {
            openCart();
        }, 800);

        // Reset l'état après 3 secondes
        setTimeout(() => {
            setIsAdded(false);
            setIsLoading(false);
        }, 3000);
    };

    const isOutOfStock = product.stock === 0;
    const isDisabled = disabled || isOutOfStock || isLoading;

    return (
        <div className="space-y-4">
            {/* Sélecteur de quantité élégant */}
            {showQuantity && !isOutOfStock && (
                <motion.div
                    className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <label className="text-sm font-medium text-gray-700">Quantité</label>
                    <div className="flex items-center space-x-1">
                        <motion.button
                            type="button"
                            onClick={() => setCurrentQuantity(Math.max(1, currentQuantity - 1))}
                            className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white border border-gray-200 flex items-center justify-center transition-all duration-200 hover:shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={currentQuantity <= 1}
                        >
                            <Minus className="h-3 w-3 text-gray-600" />
                        </motion.button>

                        <motion.span
                            className="w-12 text-center font-semibold text-gray-800"
                            key={currentQuantity}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentQuantity}
                        </motion.span>

                        <motion.button
                            type="button"
                            onClick={() => setCurrentQuantity(Math.min(product.stock ?? 0, currentQuantity + 1))}
                            className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white border border-gray-200 flex items-center justify-center transition-all duration-200 hover:shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={currentQuantity >= (product.stock ?? 0)}
                        >
                            <Plus className="h-3 w-3 text-gray-600" />
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Bouton principal élégant */}
            <motion.div
                className="relative"
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
            >
                <motion.button
                    onClick={handleAddToCart}
                    disabled={isDisabled}
                    className={`
                        relative w-full h-14 rounded-xl font-medium text-sm
                        transition-all duration-300 ease-out
                        ${isDisabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-sm'
                            : isAdded
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
                                : 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                        }
                        ${className}
                    `}
                >
                    {/* État normal */}
                    <AnimatePresence mode="wait">
                        {!isAdded && !isLoading && (
                            <motion.div
                                key="normal"
                                className="flex items-center justify-center gap-3"
                                initial={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                </motion.div>
                                <span className="font-semibold">
                                    {isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* État de chargement */}
                    <AnimatePresence mode="wait">
                        {isLoading && !isAdded && (
                            <motion.div
                                key="loading"
                                className="flex items-center justify-center gap-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                </motion.div>
                                <span className="font-semibold">Ajout en cours...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* État ajouté */}
                    <AnimatePresence mode="wait">
                        {isAdded && (
                            <motion.div
                                key="added"
                                className="flex items-center justify-center gap-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <Check className="h-5 w-5" />
                                </motion.div>
                                <span className="font-semibold">Ajouté !</span>

                                {/* Particules de confetti */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                                            initial={{
                                                x: 0,
                                                y: 0,
                                                opacity: 1,
                                                scale: 0
                                            }}
                                            animate={{
                                                x: (Math.random() - 0.5) * 100,
                                                y: -50 - Math.random() * 50,
                                                opacity: 0,
                                                scale: 1
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: i * 0.1,
                                                ease: "easeOut"
                                            }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Effet de brillance */}
                    {!isDisabled && !isAdded && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 3,
                                ease: "easeInOut"
                            }}
                        />
                    )}
                </motion.button>

                {/* Indicateur de stock */}
                {!isOutOfStock && product.stock && product.stock <= 5 && (
                    <motion.div
                        className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                    >
                        Plus que {product.stock} en stock !
                    </motion.div>
                )}
            </motion.div>

            {/* Message de confirmation élégant */}
            <AnimatePresence>
                {isAdded && (
                    <motion.div
                        className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700 font-medium">
                            Produit ajouté avec succès !
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}