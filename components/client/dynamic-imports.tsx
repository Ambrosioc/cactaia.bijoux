'use client';

import dynamic from 'next/dynamic';

// Composant NoSSR pour éviter les problèmes d'hydratation
const NoSSR = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

// Composants dynamiques avec chargement différé
export const FeaturedProducts = dynamic(
    () => import('@/components/home/featured-products'),
    {
        ssr: false,
        loading: () => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        ),
    }
);

export const FeaturedProductsOptimized = dynamic(
    () => import('@/components/home/featured-products-optimized'),
    {
        ssr: false,
        loading: () => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        ),
    }
);

export const HeroCarousel = dynamic(
    () => import('@/components/home/hero-carousel'),
    {
        ssr: false,
        loading: () => (
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        ),
    }
);

export const InstagramFeed = dynamic(
    () => import('@/components/home/instagram-feed'),
    {
        ssr: false,
        loading: () => (
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ),
    }
);

export const NewsletterForm = dynamic(
    () => import('@/components/home/newsletter-form'),
    {
        ssr: false,
        loading: () => (
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ),
    }
);

export const NewsletterModal = dynamic(
    () => import('@/components/home/newsletter-modal'),
    {
        ssr: false,
        loading: () => null,
    }
);

export const TestimonialsSection = dynamic(
    () => import('@/components/home/testimonials-section'),
    {
        ssr: false,
        loading: () => (
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        ),
    }
);

export const ValuesSection = dynamic(
    () => import('@/components/home/values-section'),
    {
        ssr: false,
        loading: () => (
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ),
    }
);

export const CollectionShowcase = dynamic(
    () => import('@/components/home/collection-showcase'),
    {
        ssr: false,
        loading: () => (
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        ),
    }
);

// Export du composant NoSSR
export { NoSSR };
