"use client";

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import OptimizedImage from './optimized-image';

interface LazyImageProps {
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
    threshold?: number;
    rootMargin?: string;
}

export default function LazyImage({
    src,
    alt,
    fill = false,
    width,
    height,
    className,
    priority = false,
    sizes,
    quality = 85,
    placeholder = 'empty',
    blurDataURL,
    threshold = 0.1,
    rootMargin = '50px',
    ...props
}: LazyImageProps) {
    const [isInView, setIsInView] = useState(priority);
    const [isLoaded, setIsLoaded] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (priority) {
            setIsInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        if (imageRef.current) {
            observer.observe(imageRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [priority, threshold, rootMargin]);

    return (
        <div ref={imageRef} className={cn('relative overflow-hidden', className)}>
            {isInView ? (
                <OptimizedImage
                    src={src}
                    alt={alt}
                    fill={fill}
                    width={!fill ? width : undefined}
                    height={!fill ? height : undefined}
                    className={cn(
                        'transition-opacity duration-300',
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    priority={priority}
                    sizes={sizes}
                    quality={quality}
                    placeholder={placeholder}
                    blurDataURL={blurDataURL}
                    onLoad={() => setIsLoaded(true)}
                    {...props}
                />
            ) : (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
        </div>
    );
} 