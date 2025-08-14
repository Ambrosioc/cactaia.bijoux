"use client";

import { cn } from '@/lib/utils';
import { getResponsiveImageSizes, getOptimalQuality } from '@/lib/config/image-optimization';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    sizes?: string;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    onLoad?: () => void;
    onError?: () => void;
    context?: 'hero' | 'product' | 'grid' | 'collection';
    variant?: string;
    responsive?: boolean;
}

export default function OptimizedImage({
    src,
    alt,
    fill = false,
    width,
    height,
    className,
    priority = false,
    sizes,
    quality,
    placeholder = 'empty',
    blurDataURL,
    onLoad,
    onError,
    context,
    variant,
    responsive = true,
    ...props
}: OptimizedImageProps) {
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

    // Fonction pour obtenir les formats optimisés
    const getOptimizedSrc = (originalSrc: string) => {
        if (!originalSrc || originalSrc.startsWith('http')) {
            return originalSrc;
        }

        const pathWithoutExt = originalSrc.replace(/\.[^/.]+$/, '');
        return {
            avif: `${pathWithoutExt}.avif`,
            webp: `${pathWithoutExt}.webp`,
            original: originalSrc
        };
    };

    // Obtenir les tailles responsive optimales
    const getOptimalSizes = () => {
        if (sizes) return sizes;
        
        if (context && variant) {
            return getResponsiveImageSizes(context, variant);
        }
        
        if (context) {
            return getResponsiveImageSizes(context);
        }
        
        // Tailles par défaut optimisées pour mobile
        return isMobile 
            ? '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
            : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    };

    // Obtenir la qualité optimale
    const getOptimalQualityValue = () => {
        if (quality) return quality;
        
        if (isMobile) {
            return getOptimalQuality('mobile');
        }
        
        return getOptimalQuality('desktop');
    };

    const optimizedSrcs = getOptimizedSrc(src);
    const optimalSizes = getOptimalSizes();
    const optimalQuality = getOptimalQualityValue();

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
    const imageSrc = hasError ? '/placeholder.jpg' : (typeof optimizedSrcs === 'string' ? optimizedSrcs : optimizedSrcs.original);

    return (
        <div className={cn(
            'relative overflow-hidden',
            fill ? 'w-full h-full' : '',
            responsive && isMobile ? 'mobile-optimized' : '',
            className
        )}>
            <Image
                src={imageSrc}
                alt={alt}
                fill={fill}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100',
                    responsive && isMobile ? 'object-cover' : 'object-cover'
                )}
                priority={priority}
                sizes={optimalSizes}
                quality={optimalQuality}
                placeholder={placeholder}
                blurDataURL={blurDataURL}
                onLoad={handleLoad}
                onError={handleError}
                {...(typeof optimizedSrcs === 'object' && {
                    srcSet: `${optimizedSrcs.avif} 1x, ${optimizedSrcs.webp} 1x, ${optimizedSrcs.original} 1x`
                })}
                {...props}
            />

            {/* Loading skeleton */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
        </div>
    );
} 