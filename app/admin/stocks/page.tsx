import StockManagement from '@/components/admin/stock-management';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gestion des Stocks - Cactaia.Bijoux',
    description: 'Gestion avancée des stocks avec alertes et historique pour Cactaia.Bijoux',
};

export default function StocksPage() {
    return <StockManagement />;
} 