import AdminSidebar from '@/components/admin/admin-sidebar';
import { NotificationProvider } from '@/components/admin/payment-notifications';
import { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Administration - Cactaia Bijoux',
  description: 'Panel d\'administration de votre boutique en ligne',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50 pt-20">
        <AdminSidebar />
        <div className="ml-64">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}