import NotificationsPageClient from '@/components/admin/notifications-page-client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notifications - Admin Cactaïa',
    description: 'Gestion des notifications système pour les administrateurs',
};

export default function NotificationsPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <NotificationsPageClient />
        </ProtectedRoute>
    );
}
