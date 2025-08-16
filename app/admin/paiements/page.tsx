import PaiementsClient from '@/components/admin/paiements-client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ClientOnly from '@/components/client/client-only';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gestion des Paiements - Cactaia Bijoux',
    description: 'Gérez et surveillez tous les paiements de votre boutique en ligne',
};

export default function PaiementsPage() {
    return (
        <ClientOnly
            fallback={
                <div className="p-8 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Chargement...</p>
                    </div>
                </div>
            }
        >
            <ProtectedRoute requireAdmin={true}>
                <PaiementsClient />
            </ProtectedRoute>
        </ClientOnly>
    );
}
