import AnalyticsDashboard from '@/components/admin/analytics-dashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ClientOnly from '@/components/client/client-only';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Analytics Avancé - Cactaia Bijoux',
    description: 'Tableau de bord analytics avancé avec graphiques de tendances, méthodes de paiement, statistiques géographiques et rapports de performance',
};

export default function AdminAnalyticsPage() {
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
                <div className="container mx-auto px-4 py-8">
                    <AnalyticsDashboard />
                </div>
            </ProtectedRoute>
        </ClientOnly>
    );
} 