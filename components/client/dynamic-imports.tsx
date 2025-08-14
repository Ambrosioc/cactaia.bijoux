'use client';

import dynamic from 'next/dynamic';

// Import dynamique des composants pour optimiser le chargement
export const CollectionShowcase = dynamic(() => import('@/components/home/collection-showcase'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
});

export const FeaturedProducts = dynamic(() => import('@/components/home/featured-products'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
});

export const FeaturedProductsOptimized = dynamic(() => import('@/components/home/featured-products-optimized'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
});

export const HeroCarousel = dynamic(() => import('@/components/home/hero-carousel'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
});

export const InstagramFeed = dynamic(() => import('@/components/home/instagram-feed'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
});

export const NewsletterModal = dynamic(() => import('@/components/home/newsletter-modal'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
});

export const TestimonialsSection = dynamic(() => import('@/components/home/testimonials-section'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
});

export const ValuesSection = dynamic(() => import('@/components/home/values-section'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
}); 