import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Administration Stripe - Cactaia Bijoux',
    description: 'Gérez vos paramètres de paiement Stripe, codes promotionnels et surveillez vos transactions',
};

export default function StripeLayout({
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
