import AddToCartButton from '@/components/cart/add-to-cart-button';
import ReviewsSection from '@/components/reviews/ReviewsSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/ui/image-carousel';
import { Separator } from '@/components/ui/separator';
import { createServerClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: product } = await supabase
    .from('produits')
    .select('nom, description_courte, images')
    .eq('slug', slug)
    .single();

  if (!product) {
    return {
      title: 'Produit non trouvé - Cactaia.Bijoux',
    };
  }

  return {
    title: `${product.nom} - Cactaia.Bijoux`,
    description: product.description_courte,
    openGraph: {
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: product } = await supabase
    .from('produits')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!product || !product.est_actif) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="inline-block">
        {i < rating ? '★' : '☆'}
      </span>
    ));
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images du produit */}
        <div className="space-y-4">
          <ImageCarousel images={product.images || []} productName={product.nom} />
        </div>

        {/* Informations du produit */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#E2725B] mb-2">{product.nom}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {product.prix_promo ? `${product.prix_promo.toFixed(2)} €` : `${product.prix.toFixed(2)} €`}
                </span>
                {product.prix_promo && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {product.prix.toFixed(2)} €
                    </span>
                    <Badge variant="destructive">
                      -{Math.round(((product.prix - product.prix_promo) / product.prix) * 100)}%
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>SKU: {product.sku}</span>
              <span>Stock: {product.stock}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Variations */}
          {product.variations && Object.keys(product.variations).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Variations</h3>
              <div className="space-y-2">
                {Object.entries(product.variations).map(([key, values]) => (
                  <div key={key}>
                    <span className="font-medium capitalize">{key}:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Array.isArray(values) && values.map((value: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <div className="space-y-3">
              <AddToCartButton product={product} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Ajouter aux favoris
              </Button>
              <Button variant="outline" className="flex-1">
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Section avis */}
      <ReviewsSection productId={product.id} limit={3} showTitle={true} />
    </div>
  );
}