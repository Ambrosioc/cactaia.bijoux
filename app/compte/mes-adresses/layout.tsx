import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mes adresses - Cactaia.Bijoux',
    description: 'Gérez vos adresses de livraison pour faciliter vos commandes.',
};

export default function AddressesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}