'use client';

import dynamic from 'next/dynamic';

export const HeroCarousel = dynamic(() => import('@/components/home/hero-carousel'), { ssr: false });
export const FeaturedProducts = dynamic(() => import('@/components/home/featured-products'), { ssr: false });
export const CollectionShowcase = dynamic(() => import('@/components/home/collection-showcase'), { ssr: false });
export const TestimonialsSection = dynamic(() => import('@/components/home/testimonials-section'), { ssr: false });
export const ValuesSection = dynamic(() => import('@/components/home/values-section'), { ssr: false }); 