'use client';

import { useRouteProtection, useAdminProtection, useUserProtection } from '@/lib/hooks/use-route-protection';
import { LoadingSpinner } from './loading-spinner';
import { UnauthorizedAccess } from './unauthorized-access';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireUser?: boolean;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireUser = false,
  fallback,
  loadingComponent,
  unauthorizedComponent
}: ProtectedRouteProps) {
  const { loading, isAuthorized } = useRouteProtection({
    requireAdmin,
    requireUser
  });

  if (loading) {
    return loadingComponent || <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return unauthorizedComponent || fallback || <UnauthorizedAccess />;
  }

  return <>{children}</>;
}

// Composants spécialisés pour plus de simplicité
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAdmin'>) {
  return (
    <ProtectedRoute requireAdmin {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function UserRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireUser'>) {
  return (
    <ProtectedRoute requireUser {...props}>
      {children}
    </ProtectedRoute>
  );
}