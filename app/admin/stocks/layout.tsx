import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gestion des Stocks - Cactaia Bijoux',
    description: 'Gestion avancée des stocks avec alertes et historique pour Cactaia Bijoux',
};

export default function StocksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto px-4 py-6">
            {children}
        </div>
    );
}
