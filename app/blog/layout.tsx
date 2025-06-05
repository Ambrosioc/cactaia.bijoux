import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Cactaia.Bijoux',
  description: 'Découvrez nos articles sur l\'univers des bijoux, les tendances, et nos inspirations.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}