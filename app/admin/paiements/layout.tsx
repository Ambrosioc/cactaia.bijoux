import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gestion des Paiements - Cactaia Bijoux',
    description: 'Gérez et surveillez tous les paiements de votre boutique en ligne',
};

export default function PaiementsLayout({
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
