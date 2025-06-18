'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/stores/userStore';
import { ROUTES, isAdminRoute, isUserRoute, isProtectedRoute } from '@/lib/constants/routes';

interface RouteProtectionOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireUser?: boolean;
}

/**
 * Hook personnalisé pour la protection des routes
 * Centralise toute la logique de vérification d'accès
 */
export function useRouteProtection(options: RouteProtectionOptions = {}) {
  const { 
    user, 
    isAuthenticated, 
    isActiveAdmin, 
    isActiveUser, 
    loading: userLoading 
  } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAccess = async () => {
      // Attendre que le store utilisateur soit initialisé
      if (userLoading) return;

      // Vérification de l'authentification
      if (options.requireAuth !== false && isProtectedRoute(pathname)) {
        if (!isAuthenticated) {
          router.push(ROUTES.LOGIN);
          return;
        }

        if (!user) {
          return; // Attendre que le profil soit chargé
        }
      }

      // Vérification des permissions admin
      if (options.requireAdmin || isAdminRoute(pathname)) {
        if (!isActiveAdmin) {
          router.push(ROUTES.USER_ACCOUNT);
          return;
        }
      }

      // Vérification des permissions utilisateur
      if (options.requireUser || isUserRoute(pathname)) {
        if (!isActiveUser) {
          router.push(ROUTES.ADMIN_DASHBOARD);
          return;
        }
      }

      // Redirection personnalisée
      if (options.redirectTo) {
        router.push(options.redirectTo);
        return;
      }

      setIsAuthorized(true);
      setLoading(false);
    };

    checkAccess();
  }, [
    isAuthenticated, 
    user, 
    isActiveAdmin, 
    isActiveUser, 
    userLoading, 
    router, 
    pathname,
    options.requireAuth,
    options.requireAdmin,
    options.requireUser,
    options.redirectTo
  ]);

  return { 
    loading, 
    isAuthorized,
    user,
    isAuthenticated,
    isActiveAdmin,
    isActiveUser
  };
}

/**
 * Hook spécialisé pour les pages admin
 */
export function useAdminProtection() {
  return useRouteProtection({ requireAdmin: true });
}

/**
 * Hook spécialisé pour les pages utilisateur
 */
export function useUserProtection() {
  return useRouteProtection({ requireUser: true });
}

/**
 * Hook spécialisé pour les pages nécessitant une authentification
 */
export function useAuthProtection() {
  return useRouteProtection({ requireAuth: true });
}