/**
 * Constantes de routes pour une navigation centralisée et sécurisée
 */

export const ROUTES = {
  HOME: '/',
  COLLECTIONS: '/collections',
  CONTACT: '/contact',
  ABOUT: '/a-propos',
  FAQ: '/faq',
  LEGAL: '/mentions-legales',
  TERMS: '/cgv',
  RETURNS: '/retours',
  SHIPPING: '/livraison',
  ACCOUNT: '/compte',
  LOGIN: '/connexion',
  REGISTER: '/inscription',
  CART: '/panier',
  WISHLIST: '/wishlist',
  CHECKOUT: '/checkout',
  CONFIRMATION: '/confirmation',
  ADMIN: '/admin',
} as const;

/**
 * Fonction utilitaire pour déterminer la route de redirection après connexion
 */
export function getRedirectRoute(userRole: 'user' | 'admin', activeRole: 'user' | 'admin'): string {
  if (userRole === 'admin' && activeRole === 'admin') {
    return ROUTES.ADMIN;
  }
  return ROUTES.ACCOUNT;
}

/**
 * Fonction utilitaire pour vérifier si une route nécessite une authentification
 */
export function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/compte') || pathname.startsWith('/admin');
}

/**
 * Fonction utilitaire pour vérifier si une route est réservée aux admins
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/**
 * Fonction utilitaire pour vérifier si une route est réservée aux utilisateurs
 */
export function isUserRoute(pathname: string): boolean {
  return pathname.startsWith('/compte');
}