import { products } from '@/lib/data/products';

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
} 