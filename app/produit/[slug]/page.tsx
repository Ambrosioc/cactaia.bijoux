"use client"

import { colorClasses, colorNames, getProductBySlug, getRelatedProducts } from '@/lib/data/products';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const product = getProductBySlug(slug);
  const relatedProducts = product ? getRelatedProducts(product.id) : [];

  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);

  if (!product) {
    return (
      <div className="pt-24 pb-16 container-custom">
        <div className="flex flex-col items-center justify-center py-24">
          <h1 className="heading-lg mb-4">Produit non trouvé</h1>
          <p className="text-muted-foreground mb-8">
            Désolé, le produit que vous recherchez n'existe pas.
          </p>
          <Link href="/boutique" className="btn btn-primary px-8 py-3">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container-custom">
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
              {product.name}
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
              {product.isNew && (
                <div className="absolute top-4 left-4 z-10 bg-primary text-white text-xs px-2 py-1 rounded">
                  Nouveau
                </div>
              )}
              <Image
                src={product.images[currentImage]}
                alt={product.name}
                fill
                className="object-cover"
              />

              {/* Navigation arrows */}
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
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`relative aspect-square rounded-md overflow-hidden ${currentImage === i ? 'ring-2 ring-primary' : ''
                    }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - vue ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="heading-lg mb-2">{product.name}</h1>
            <p className="text-2xl font-medium mb-4">{product.price.toFixed(2)}€</p>

            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>

            {/* Color Selection */}
            <div className="mb-6">
              <p className="font-medium mb-2">Couleur: {colorNames[selectedColor as keyof typeof colorNames] || ''}</p>
              <div className="flex space-x-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses[color]
                      } ${selectedColor === color
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''
                      }`}
                    title={colorNames[color]}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection (if applicable) */}
            {product.sizes && (
              <div className="mb-6">
                <p className="font-medium mb-2">Taille:</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 border rounded-md ${selectedSize === size
                        ? 'bg-primary text-white border-primary'
                        : 'border-input hover:border-primary'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="font-medium mb-2">Quantité:</p>
              <div className="flex items-center">
                <button
                  onClick={decreaseQuantity}
                  className="p-2 border border-input rounded-l-md hover:bg-secondary"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="px-4 py-2 border-t border-b border-input min-w-[40px] text-center">
                  {quantity}
                </div>
                <button
                  onClick={increaseQuantity}
                  className="p-2 border border-input rounded-r-md hover:bg-secondary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="flex-1 btn btn-primary py-3 flex items-center justify-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Ajouter au panier
              </button>
              <button className="btn btn-outline py-3 px-4 flex items-center justify-center gap-2">
                <Heart className="h-5 w-5" />
                <span className="sr-only md:not-sr-only">Ajouter aux favoris</span>
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t border-border pt-6 mb-8">
              <h3 className="text-lg font-medium mb-3">Détails du produit</h3>
              <p className="text-muted-foreground mb-4">
                {product.details}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Matériaux</p>
                  <p className="text-muted-foreground">Acier inoxydable 316L</p>
                </div>
                <div>
                  <p className="font-medium">Hypoallergénique</p>
                  <p className="text-muted-foreground">Oui</p>
                </div>
              </div>
            </div>

            {/* Collections */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium mb-3">Collections</h3>
              <div className="flex flex-wrap gap-2">
                {product.collections.map(collection => (
                  <Link
                    key={collection}
                    href={`/collections/${collection.toLowerCase()}`}
                    className="px-3 py-1 bg-secondary rounded-md text-sm hover:bg-secondary/80 transition-colors"
                  >
                    {collection}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="heading-md mb-8">Vous aimerez aussi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct, i) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group"
                >
                  <Link href={`/produit/${relatedProduct.slug}`}>
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-secondary/30">
                      <Image
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{relatedProduct.category}</p>
                      <h3 className="font-medium">{relatedProduct.name}</h3>
                      <p className="font-medium">{relatedProduct.price.toFixed(2)}€</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}