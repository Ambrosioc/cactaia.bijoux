import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gestion des Médias - Cactaia Bijoux',
    description: 'Gérez les images, vidéos et documents de votre blog et site web',
};

export default function MediasLayout({
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
