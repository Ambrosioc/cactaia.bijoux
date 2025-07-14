"use client"

import OptimizedImage from '@/components/ui/optimized-image';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Sample product data
const featuredProducts = [
  {
    id: 'bracelet-cactus',
    name: 'Bracelet Cactus',
    price: 59.00,
    image: 'https://images.pexels.com/photos/9428804/pexels-photo-9428804.jpeg',
    category: 'Bracelets',
    new: true,
    colors: ['gold', 'silver', 'rose-gold'],
  },
  {
    id: 'collier-desert',
    name: 'Collier Désert',
    price: 65.00,
    image: 'https://images.pexels.com/photos/10964788/pexels-photo-10964788.jpeg',
    category: 'Colliers',
    new: false,
    colors: ['gold', 'silver'],
  },
  {
    id: 'boucles-soleil',
    name: 'Boucles Soleil',
    price: 45.00,
    image: 'https://images.pexels.com/photos/6767789/pexels-photo-6767789.jpeg',
    category: 'Boucles d\'oreilles',
    new: false,
    colors: ['gold', 'silver', 'rose-gold'],
  },
  {
    id: 'bracelet-dune',
    name: 'Bracelet Dune',
    price: 55.00,
    image: 'https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg',
    category: 'Bracelets',
    new: true,
    colors: ['gold', 'silver'],
  },
];

const FeaturedProducts = () => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleProducts = 3; // Number of products visible at once

  const nextProducts = () => {
    setStartIndex((prevIndex) =>
      (prevIndex + 1) % featuredProducts.length
    );
  };

  const prevProducts = () => {
    setStartIndex((prevIndex) =>
      prevIndex === 0 ? featuredProducts.length - 1 : prevIndex - 1
    );
  };

  // Get the products to display
  const displayProducts = [...featuredProducts, ...featuredProducts].slice(
    startIndex,
    startIndex + visibleProducts
  );

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-12">
          <h2 className="heading-lg">Nos produits phares</h2>
          <div className="flex space-x-2">
            <button
              onClick={prevProducts}
              className="p-2 rounded-full border border-border hover:bg-accent transition-colors"
              aria-label="Produits précédents"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextProducts}
              className="p-2 rounded-full border border-border hover:bg-accent transition-colors"
              aria-label="Produits suivants"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayProducts.map((product, i) => (
            <motion.div
              key={`${product.id}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group"
            >
              <Link href={`/produit/${product.id}`}>
                <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-secondary/30">
                  {product.new && (
                    <div className="absolute top-2 left-2 z-10 bg-primary text-white text-xs px-2 py-1 rounded">
                      Nouveau
                    </div>
                  )}
                  <button
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
                    aria-label="Ajouter aux favoris"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  <OptimizedImage
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="font-medium">{product.price.toFixed(2)}€</p>
                </div>
              </Link>
              <div className="mt-3 flex space-x-2">
                {product.colors.map((color) => (
                  <div
                    key={color}
                    className={`w-3 h-3 rounded-full ${color === 'gold'
                        ? 'bg-yellow-400'
                        : color === 'silver'
                          ? 'bg-gray-300'
                          : 'bg-pink-300'
                      }`}
                    aria-label={`Couleur: ${color}`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/boutique"
            className="btn btn-outline px-8 py-2"
          >
            Voir tous les produits
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;