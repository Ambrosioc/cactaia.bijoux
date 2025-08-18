import CategoriesPageClient from '@/components/admin/categories-page-client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Catégories - Admin Cactaïa',
    description: 'Gestion des catégories de produits',
};

export default function CategoriesPage() {
    return (
        <ProtectedRoute requireAdmin={true}>
            <CategoriesPageClient />
        </ProtectedRoute>
    );
}
