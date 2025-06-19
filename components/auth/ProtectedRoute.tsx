'use client';

import { useSession } from '@/lib/hooks/useSession';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'user';
    fallback?: React.ReactNode;
}

export function ProtectedRoute({
    children,
    requiredRole,
    fallback
}: ProtectedRouteProps) {
    const { session, loading, isAdmin, isUser } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !session) {
            // Rediriger vers la connexion avec l'URL de retour
            const currentPath = window.location.pathname;
            router.push(`/connexion?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }

        // Ne pas rediriger automatiquement lors des changements de rôle
        // Laisser l'utilisateur rester sur la page actuelle
    }, [session, loading, router]);

    // Afficher le fallback pendant le chargement
    if (loading) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    // Si pas de session, ne rien afficher (redirection en cours)
    if (!session) {
        return null;
    }

    // Afficher le contenu même si le rôle ne correspond pas exactement
    // L'utilisateur peut rester sur la page et changer de rôle
    return <>{children}</>;
} 