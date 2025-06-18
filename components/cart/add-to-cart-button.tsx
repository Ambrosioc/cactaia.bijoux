'use client';

import type { Product } from '@/lib/supabase/types';
import { useCart } from '@/stores/cartStore';
import { motion } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';
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

    const handleAddToCart = () => {
        if (product.stock === 0 || disabled) return;

        addItem(product, currentQuantity, variations);
        setIsAdded(true);

        // Ouvrir le panier après un court délai
        setTimeout(() => {
            openCart();
        }, 500);

        // Reset l'état après 2 secondes
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    };

    const isOutOfStock = product.stock === 0;
    const isDisabled = disabled || isOutOfStock;

    return (
        <div className="space-y-3">
            {showQuantity && !isOutOfStock && (
                <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium">Quantité:</label>
                    <div className="flex items-center border border-input rounded-md">
                        <button
                            type="button"
                            onClick={() => setCurrentQuantity(Math.max(1, currentQuantity - 1))}
                            className="p-2 hover:bg-secondary"
                            disabled={currentQuantity <= 1}
                        >
                            <span className="text-sm">-</span>
                        </button>
                        <span className="px-4 py-2 text-sm">{currentQuantity}</span>
                        <button
                            type="button"
                            onClick={() => setCurrentQuantity(Math.min(product.stock, currentQuantity + 1))}
                            className="p-2 hover:bg-secondary"
                            disabled={currentQuantity >= product.stock}
                        >
                            <span className="text-sm">+</span>
                        </button>
                    </div>
                </div>
            )}

            <motion.button
                onClick={handleAddToCart}
                disabled={isDisabled}
                className={`
          relative overflow-hidden transition-all duration-200
          ${isDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isAdded
                            ? 'bg-green-500 text-white'
                            : 'btn btn-primary'
                    }
          ${className}
        `}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
            >
                <motion.div
                    className="flex items-center justify-center gap-2"
                    animate={isAdded ? { y: -30 } : { y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ShoppingBag className="h-4 w-4" />
                    {isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
                </motion.div>

                <motion.div
                    className="absolute inset-0 flex items-center justify-center gap-2"
                    animate={isAdded ? { y: 0 } : { y: 30 }}
                    transition={{ duration: 0.3 }}
                >
                    <Check className="h-4 w-4" />
                    Ajouté !
                </motion.div>
            </motion.button>
        </div>
    );
}