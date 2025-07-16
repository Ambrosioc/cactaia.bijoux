import AdminSidebar from '@/components/admin/admin-sidebar';
import { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Administration - Cactaia.Bijoux',
  description: 'Interface d\'administration pour Cactaia.Bijoux',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 pt-20">
      <AdminSidebar />
      <main className="flex-1 overflow-auto admin-main">
        {children}
      </main>
    </div>
  );
}