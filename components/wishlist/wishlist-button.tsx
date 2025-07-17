"use client"

import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface WishlistButtonProps {
    productId: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outline' | 'ghost';
    showText?: boolean;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function WishlistButton({
    productId,
    className,
    size = 'md',
    variant = 'ghost',
    showText = false,
    onSuccess,
    onError
}: WishlistButtonProps) {
    const { isInWishlist, toggleWishlist, loading } = useWishlist();

    const handleToggle = async () => {
        const result = await toggleWishlist(productId);

        if (result.success) {
            onSuccess?.();
        } else if (result.error) {
            onError?.(result.error);
        }
    };

    const isWishlisted = isInWishlist(productId);

    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12'
    };

    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    return (
        <Button
            variant={variant}
            size={showText ? undefined : 'icon'}
            className={cn(
                'transition-all duration-200',
                isWishlisted && 'text-red-500 hover:text-red-600',
                !isWishlisted && 'text-muted-foreground hover:text-red-500',
                showText ? '' : sizeClasses[size],
                className
            )}
            onClick={handleToggle}
            disabled={loading}
            aria-label={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
        >
            <Heart
                className={cn(
                    'transition-all duration-200',
                    iconSizes[size],
                    isWishlisted ? 'fill-current' : 'fill-none'
                )}
            />
            {showText && (
                <span className="ml-2">
                    {isWishlisted ? 'Retirer' : 'Ajouter à la wishlist'}
                </span>
            )}
        </Button>
    );
} 