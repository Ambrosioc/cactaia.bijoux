'use client';

import { analytics } from '@/lib/analytics';
import { useUser } from '@/stores/userStore';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useAnalytics() {
  const { user } = useUser();
  const pathname = usePathname();

  // Tracker automatiquement les vues de pages
  useEffect(() => {
    if (pathname) {
      analytics.trackPageView(pathname, user?.id);
    }
  }, [pathname, user?.id]);

  return {
    trackProductView: (productId: string, productName: string, productPrice: number) => {
      analytics.trackProductView(productId, productName, productPrice, user?.id);
    },
    trackAddToCart: (productId: string, productName: string, productPrice: number) => {
      analytics.trackAddToCart(productId, productName, productPrice, user?.id);
    },
    trackPurchase: (orderId: string, orderTotal: number) => {
      analytics.trackPurchase(orderId, orderTotal, user?.id);
    },
    trackSearch: (searchTerm: string) => {
      analytics.trackSearch(searchTerm, user?.id);
    },
    trackUserSignup: () => {
      if (user?.id) {
        analytics.trackUserSignup(user.id);
      }
    },
    trackUserLogin: () => {
      if (user?.id) {
        analytics.trackUserLogin(user.id);
      }
    }
  };
} 