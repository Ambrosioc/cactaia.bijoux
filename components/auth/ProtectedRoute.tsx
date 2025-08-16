'use client';

import { useUser } from '@/stores/userStore';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    fallback?: React.ReactNode;
}

export default function ProtectedRoute({
    children,
    requireAdmin = false,
    fallback
}: ProtectedRouteProps) {
    const { isAuthenticated, isAdmin, isActiveAdmin, loading } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Pendant l'hydratation, afficher un loader
    if (!mounted || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Vérification de la session...</p>
                </div>
            </div>
        );
    }

    // Vérifier l'authentification
    if (!isAuthenticated) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-medium mb-4">Accès non autorisé</h1>
                    <p className="text-muted-foreground">
                        Vous devez être connecté pour accéder à cette page.
                    </p>
                </div>
            </div>
        );
    }

    // Vérifier les droits admin si requis
    if (requireAdmin && !isActiveAdmin) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-medium mb-4">Accès non autorisé</h1>
                    <p className="text-muted-foreground">
                        Vous devez être administrateur pour accéder à cette page.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
} 