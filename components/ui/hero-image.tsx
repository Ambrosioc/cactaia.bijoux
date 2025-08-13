"use client";

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ReactNode, useEffect, useState } from 'react';

interface HeroImageProps {
    src: string;
    alt: string;
    children?: ReactNode;
    overlayClassName?: string;
    className?: string;
    priority?: boolean;
    zoomEffect?: boolean;
    zoomIntensity?: 'subtle' | 'medium' | 'strong';
    overlayOpacity?: number;
    showGradient?: boolean;
}

export default function HeroImage({
    src,
    alt,
    children,
    overlayClassName = 'bg-black/40',
    className = '',
    priority = false,
    zoomEffect = true,
    zoomIntensity = 'medium',
    overlayOpacity = 0.2,
    showGradient = true,
}: HeroImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Détecter si on est sur mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Configuration du zoom selon l'intensité
    const getZoomConfig = () => {
        if (!zoomEffect) return '';

        switch (zoomIntensity) {
            case 'subtle':
                return 'scale-105 hover:scale-100';
            case 'medium':
                return 'scale-110 hover:scale-105';
            case 'strong':
                return 'scale-125 hover:scale-110';
            default:
                return 'scale-110 hover:scale-105';
        }
    };

    const handleLoad = () => {
        setIsLoaded(true);
    };

    return (
        <div className={cn(
            'relative w-full h-full overflow-hidden',
            className
        )}>
            {/* Gradient de fond optionnel */}
            {showGradient && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 z-10" />
            )}

            {/* Image avec effet de zoom */}
            <Image
                src={src}
                alt={alt}
                fill
                className={cn(
                    'object-cover transition-all duration-[3000ms] ease-out',
                    getZoomConfig(),
                    isLoaded ? 'opacity-100' : 'opacity-0',
                    // Désactiver le zoom sur mobile pour de meilleures performances
                    isMobile && zoomEffect ? 'scale-100 hover:scale-100' : ''
                )}
                priority={priority}
                onLoad={handleLoad}
            />

            {/* Overlay personnalisable */}
            <div
                className={cn(
                    'absolute inset-0 z-20',
                    overlayClassName
                )}
                style={{
                    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`
                }}
            />

            {/* Contenu enfant */}
            {children && (
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    );
}
