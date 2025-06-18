"use client"

import AddToCartButton from '@/components/cart/add-to-cart-button';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/supabase/types';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart, Package, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      // Essayer de trouver le produit par SKU d'abord, puis par ID
      let { data: productData, error: productError } = await supabase
        .from('produits')
        .select('*')
        .eq('sku', slug)
        .eq('est_actif', true)
        .maybeSingle();

      // Si pas trouvé par SKU, essayer par ID
      if (!productData && !productError) {
        const { data: productById, error: errorById } = await supabase
          .from('produits')
          .select('*')
          .eq('id', slug)
          .eq('est_actif', true)
          .maybeSingle();

        productData = productById;
        productError = errorById;
      }

      if (productError) {
        throw productError;
      }

      if (!productData) {
        setError('Produit non trouvé');
        return;
      }

      setProduct(productData);

      // Charger les produits similaires
      const { data: relatedData } = await supabase
        .from('produits')
        .select('*')
        .eq('categorie', productData.categorie)
        .eq('est_actif', true)
        .neq('id', productData.id)
        .limit(4);

      setRelatedProducts(relatedData || []);

    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      setError('Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (product: Product, index: number = 0): string => {
    if (product.images && product.images.length > index) {
      return product.images[index];
    }
    return '/placeholder.jpg';
  };

  const getPrice = (product: Product) => {
    const hasPromo = product.prix_promo && product.prix_promo < product.prix;
    return {
      current: hasPromo ? product.prix_promo : product.prix,
      original: product.prix,
      hasPromo
    };
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImage((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImage((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-24 pb-16 container-custom">
        <div className="flex flex-col items-center justify-center py-24">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="heading-lg mb-4">Produit non trouvé</h1>
          <p className="text-muted-foreground mb-8">
            {error || "Désolé, le produit que vous recherchez n'existe pas."}
          </p>
          <Link href="/boutique" className="btn btn-primary px-8 py-3">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const price = getPrice(product);
  const hasImages = product.images && product.images.length > 0;

  return (
    <div className="pt-24 pb-16">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center py-4 mb-8">
          <ol className="flex text-sm">
            <li className="flex items-center">
              <Link href="/" className="text-muted-foreground hover:text-primary">
                Accueil
              </Link>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <Link href="/boutique" className="text-muted-foreground hover:text-primary">
                Boutique
              </Link>
              <span className="mx-2">/</span>
            </li>
            <li className="text-muted-foreground">
              {product.nom}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square bg-secondary/30 rounded-lg overflow-hidden mb-4">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.est_mis_en_avant && (
                  <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Featured
                  </div>
                )}
                {price.hasPromo && (
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Promotion
                  </div>
                )}
              </div>

              <Image
                src={getImageUrl(product, currentImage)}
                alt={product.nom}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.jpg';
                }}
              />

              {/* Navigation arrows */}
              {hasImages && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                    aria-label="Image précédente"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                    aria-label="Image suivante"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {hasImages && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {product.images.slice(0, 3).map((image, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`relative aspect-square rounded-md overflow-hidden ${currentImage === i ? 'ring-2 ring-primary' : ''
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.nom} - vue ${i + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              {/* Header */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">{product.categorie}</p>
                <h1 className="heading-lg mb-4">{product.nom}</h1>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-medium">
                    {price?.current?.toFixed(2)}€
                  </span>
                  {price.hasPromo && (
                    <span className="text-xl text-muted-foreground line-through">
                      {price.original.toFixed(2)}€
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Stock Status */}
              <div>
                {product.stock === 0 ? (
                  <p className="text-red-600 font-medium">Rupture de stock</p>
                ) : product.stock <= 5 ? (
                  <p className="text-orange-600">Plus que {product.stock} en stock</p>
                ) : (
                  <p className="text-green-600">En stock</p>
                )}
              </div>

              {/* Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <AddToCartButton
                    product={product}
                    className="w-full py-3"
                    showQuantity={true}
                  />
                </div>
                <button className="btn btn-outline py-3 px-4 flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only md:not-sr-only">Favoris</span>
                </button>
              </div>

              {/* Product Details */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-medium mb-3">Détails du produit</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">SKU</p>
                    <p className="text-muted-foreground">{product.sku || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Catégorie</p>
                    <p className="text-muted-foreground">{product.categorie}</p>
                  </div>
                  {product.poids_grammes && (
                    <div>
                      <p className="font-medium">Poids</p>
                      <p className="text-muted-foreground">{product.poids_grammes}g</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">TVA</p>
                    <p className="text-muted-foreground">
                      {product.tva_applicable ? 'Applicable' : 'Non applicable'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="heading-md mb-8">Vous aimerez aussi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct, i) => {
                const relatedPrice = getPrice(relatedProduct);

                return (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="group"
                  >
                    <Link href={`/produit/${relatedProduct.sku || relatedProduct.id}`}>
                      <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-secondary/30">
                        <Image
                          src={getImageUrl(relatedProduct)}
                          alt={relatedProduct.nom}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{relatedProduct.categorie}</p>
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {relatedProduct.nom}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {relatedPrice?.current?.toFixed(2)}€
                          </span>
                          {relatedPrice.hasPromo && (
                            <span className="text-sm text-muted-foreground line-through">
                              {relatedPrice.original.toFixed(2)}€
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}