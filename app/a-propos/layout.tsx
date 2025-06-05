import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos - Cactaia.Bijoux',
  description: 'Découvrez l\'histoire et les valeurs de Cactaia.Bijoux, une marque de bijoux écoresponsables, mixtes et élégants.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}