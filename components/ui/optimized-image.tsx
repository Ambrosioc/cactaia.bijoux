"use client";

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

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
}

export default function OptimizedImage({
    src,
    alt,
    fill = false,
    width,
    height,
    className,
    priority = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality = 85,
    placeholder = 'empty',
    blurDataURL,
    onLoad,
    onError,
    ...props
}: OptimizedImageProps) {
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

    const optimizedSrcs = getOptimizedSrc(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

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
        <div className={cn('relative overflow-hidden', fill ? 'w-full h-full' : '', className)}>
            <Image
                src={imageSrc}
                alt={alt}
                fill={fill}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100'
                )}
                priority={priority}
                sizes={sizes}
                quality={quality}
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