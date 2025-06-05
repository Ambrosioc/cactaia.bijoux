"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { products } from '@/lib/data/products';

// Sample wishlist items for demonstration
const initialWishlistItems = [
  products[0],
  products[2],
  products[4],
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(initialWishlistItems);
  
  const removeFromWishlist = (productId: string) => {
    setWishlistItems(items => items.filter(item => item.id !== productId));
  };
  
  if (wishlistItems.length === 0) {
    return (
      <div className="pt-24 pb-16">
        <div className="container-custom">
          <h1 className="heading-lg mb-8 text-center">Ma liste de souhaits</h1>
          <div className="max-w-md mx-auto text-center py-12">
            <div className="flex justify-center mb-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-medium mb-4">Votre liste est vide</h2>
            <p className="text-muted-foreground mb-8">
              Vous n'avez pas encore ajouté d'articles à votre liste de souhaits. Découvrez nos collections et trouvez des bijoux qui vous ressemblent.
            </p>
            <Link href="/boutique" className="btn btn-primary px-8 py-3">
              Découvrir nos bijoux
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-24 pb-16">
      <div className="container-custom">
        <h1 className="heading-lg mb-8">Ma liste de souhaits</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistItems.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group"
            >
              <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-secondary/30">
                {item.isNew && (
                  <div className="absolute top-2 left-2 z-10 bg-primary text-white text-xs px-2 py-1 rounded">
                    Nouveau
                  </div>
                )}
                <Link href={`/produit/${item.slug}`}>
                  <Image 
                    src={item.images[0]} 
                    alt={item.name} 
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-red-500 transition-colors"
                  aria-label="Retirer de la liste de souhaits"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <Link href={`/produit/${item.slug}`}>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="font-medium">{formatPrice(item.price)}</p>
                <div className="flex space-x-2">
                  {item.colors.map((color) => (
                    <div 
                      key={color}
                      className={`w-3 h-3 rounded-full ${
                        color === 'gold' 
                          ? 'bg-yellow-400' 
                          : color === 'silver' 
                          ? 'bg-gray-300' 
                          : 'bg-pink-300'
                      }`}
                      aria-label={`Couleur: ${color}`}
                    />
                  ))}
                </div>
                <button className="w-full btn btn-primary py-2 mt-4 flex items-center justify-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Ajouter au panier
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/boutique" className="btn btn-outline px-8 py-2">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}