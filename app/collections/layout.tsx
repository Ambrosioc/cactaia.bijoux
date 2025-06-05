import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections - Cactaia.Bijoux',
  description: 'Découvrez nos collections de bijoux écoresponsables, élégants et intemporels.',
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}