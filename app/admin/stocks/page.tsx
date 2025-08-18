import StockManagementClient from '@/components/admin/stock-management';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ClientOnly from '@/components/client/client-only';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gestion des Stocks - Cactaia.Bijoux',
    description: 'Gestion avancée des stocks avec alertes et historique pour Cactaia.Bijoux',
};

export default function StocksPage() {
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
                <StockManagementClient />
            </ProtectedRoute>
        </ClientOnly>
    );
} 