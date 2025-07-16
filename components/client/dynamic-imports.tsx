'use client';

import dynamic from 'next/dynamic';

// Dynamic imports for better performance
export const HeroCarousel = dynamic(() => import('@/components/home/hero-carousel'), {
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
});

export const FeaturedProducts = dynamic(() => import('@/components/home/featured-products'), {
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
});

export const CollectionShowcase = dynamic(() => import('@/components/home/collection-showcase'), {
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
});

export const ValuesSection = dynamic(() => import('@/components/home/values-section'), {
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
});

export const TestimonialsSection = dynamic(() => import('@/components/home/testimonials-section'), {
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
});

export const InstagramFeed = dynamic(() => import('@/components/home/instagram-feed'), {
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
});

export const NewsletterForm = dynamic(() => import('@/components/home/newsletter-form'), {
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
});

export const NewsletterModal = dynamic(() => import('@/components/home/newsletter-modal'), {
    loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
}); 