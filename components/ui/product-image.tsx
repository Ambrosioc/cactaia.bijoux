"use client";

import { cn } from '@/lib/utils';
import { getResponsiveImageSizes, getOptimalQuality } from '@/lib/config/image-optimization';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ProductImageProps {
    src: string;
    alt: string;
    variant?: 'main' | 'thumbnail' | 'gallery';
    className?: string;
    priority?: boolean;
    fill?: boolean;
    width?: number;
    height?: number;
    onLoad?: () => void;
    onError?: () => void;
    showBadge?: boolean;
    badgeText?: string;
    badgeColor?: 'primary' | 'success' | 'warning';
}

export default function ProductImage({
    src,
    alt,
    variant = 'main',
    className,
    priority = false,
    fill = true,
    width,
    height,
    onLoad,
    onError,
    showBadge = false,
    badgeText,
    badgeColor = 'primary',
}: ProductImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Détecter si on est sur mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 640);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Obtenir les tailles optimales selon le variant
    const getOptimalSizes = () => {
        return getResponsiveImageSizes('product', variant);
    };

    // Obtenir la qualité optimale
    const getOptimalQualityValue = () => {
        if (isMobile) {
            return getOptimalQuality('mobile');
        }
        return getOptimalQuality('desktop');
    };

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        onError?.();
    };

    // Fallback vers placeholder si erreur
    const imageSrc = hasError ? '/placeholder.jpg' : src;

    // Classes pour le badge
    const badgeClasses = {
        primary: 'bg-primary text-white',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
    };

    return (
        <div className={cn(
            'relative overflow-hidden',
            fill ? 'w-full h-full' : '',
            isMobile ? 'mobile-optimized' : '',
            className
        )}>
            <Image
                src={imageSrc}
                alt={alt}
                fill={fill}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                className={cn(
                    'transition-all duration-300',
                    isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
                    'object-cover',
                    // Optimisations spécifiques pour mobile
                    isMobile && variant === 'main' ? 'object-center' : 'object-cover'
                )}
                priority={priority}
                sizes={getOptimalSizes()}
                quality={getOptimalQualityValue()}
                placeholder="empty"
                onLoad={handleLoad}
                onError={handleError}
            />

            {/* Badge optionnel */}
            {showBadge && badgeText && (
                <div className={cn(
                    'absolute top-2 left-2 z-10 text-xs px-2 py-1 rounded font-medium',
                    badgeClasses[badgeColor]
                )}>
                    {badgeText}
                </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}

            {/* Overlay d'erreur */}
            {hasError && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm">Image non disponible</p>
                    </div>
                </div>
            )}
        </div>
    );
}
