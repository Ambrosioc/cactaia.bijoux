/**
 * Constantes de routes pour une navigation centralisée et sécurisée
 */

export const ROUTES = {
  // Pages publiques
  HOME: '/',
  BOUTIQUE: '/boutique',
  COLLECTIONS: '/collections',
  ABOUT: '/a-propos',
  BLOG: '/blog',
  CONTACT: '/contact',
  FAQ: '/faq',

  // Authentification
  LOGIN: '/connexion',
  SIGNUP: '/inscription',

  // Pages protégées utilisateur (active_role = 'user')
  USER_ACCOUNT: '/compte',
  USER_ORDERS: '/compte/commandes',
  USER_WISHLIST: '/compte/favoris',
  USER_SETTINGS: '/compte/parametres',

  // Pages protégées admin (role = 'admin' ET active_role = 'admin')
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PRODUCTS: '/admin/produits',
  ADMIN_ORDERS: '/admin/commandes',
  ADMIN_USERS: '/admin/utilisateurs',
  ADMIN_SETTINGS: '/admin/parametres',

  // Autres
  CART: '/panier',
  WISHLIST: '/wishlist',
  PRODUCT: (slug: string) => `/produit/${slug}`,
  COLLECTION: (id: string) => `/collections/${id}`,
} as const;

/**
 * Fonction utilitaire pour déterminer la route de redirection après connexion
 */
export function getRedirectRoute(userRole: 'user' | 'admin', activeRole: 'user' | 'admin'): string {
  if (userRole === 'admin' && activeRole === 'admin') {
    return ROUTES.ADMIN_DASHBOARD;
  }
  return ROUTES.USER_ACCOUNT;
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