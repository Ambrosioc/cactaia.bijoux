import { Metadata } from 'next';
import CollectionsPageClient from '@/components/admin/collections-page-client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
    title: 'Collections - Admin Cactaïa',
    description: 'Gestion des collections de produits',
};

export default function CollectionsPage() {
    return (
        <ProtectedRoute requireAdmin={true}>
            <CollectionsPageClient />
        </ProtectedRoute>
    );
}
