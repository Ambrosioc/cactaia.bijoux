import PaiementDetailClient from '@/components/admin/paiement-detail-client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ClientOnly from '@/components/client/client-only';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Détail du Paiement - Cactaia Bijoux',
    description: 'Détails complets d\'un paiement avec informations Stripe et commande',
};

export default function PaiementDetailPage({ params }: { params: { id: string } }) {
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
                <PaiementDetailClient paymentId={params.id} />
            </ProtectedRoute>
        </ClientOnly>
    );
}
