import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Cactaia.Bijoux',
  description: 'Trouvez des réponses à toutes vos questions concernant nos bijoux, commandes, livraisons et retours.',
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}