import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administration - Cactaia.Bijoux',
  description: 'Interface d\'administration pour Cactaia.Bijoux',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}