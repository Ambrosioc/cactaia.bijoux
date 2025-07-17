"use client"

import { Button } from '@/components/ui/button';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { useWishlist } from '@/hooks/use-wishlist';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/stores/cartStore';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlistItems, wishlistLoading, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: any) => {
    // Convertir le format de la wishlist vers le format du panier
    const product = {
      id: item.product_id,
      nom: item.product_name,
      prix: item.product_price,
      prix_promo: item.product_promo_price,
      categorie: item.product_category,
      images: item.product_images,
      slug: item.product_slug,
      stock: item.product_stock,
      variations: {},
      est_actif: item.product_active,
      est_mis_en_avant: false,
      description: item.product_description,
      description_courte: item.product_description,
      sku: '',
      poids_grammes: 0,
      tva_applicable: true,
      collections: [],
      low_stock_threshold: 5,
      overstock_threshold: 100,
      stock_warning_enabled: true,
      created_at: item.added_at,
      updated_at: item.added_at
    };

    addItem(product, 1);
  };

  if (wishlistLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container-custom">
          <h1 className="heading-lg mb-8">Ma liste de souhaits</h1>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="pt-24 pb-16">
        <div className="container-custom">
          <h1 className="heading-lg mb-8 text-center">Ma liste de souhaits</h1>
          <div className="max-w-md mx-auto text-center py-12">
            <div className="flex justify-center mb-6">
              <Heart className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-medium mb-4">Votre liste est vide</h2>
            <p className="text-muted-foreground mb-8">
              Vous n&apos;avez pas encore ajouté d&apos;articles à votre liste de souhaits. Découvrez nos collections et trouvez des bijoux qui vous ressemblent.
            </p>
            <Link href="/collections" className="btn btn-primary px-8 py-3">
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
              key={item.wishlist_item_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group"
            >
              <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-secondary/30">
                {item.product_images && item.product_images.length > 0 && (
                  <Link href={`/produit/${item.product_slug}`}>
                    <Image
                      src={item.product_images[0]}
                      alt={item.product_name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                )}
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <WishlistButton
                    productId={item.product_id}
                    size="sm"
                    variant="ghost"
                    className="bg-white/80 hover:bg-white text-red-500"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white/80 hover:bg-white text-red-500"
                    onClick={() => removeFromWishlist(item.product_id)}
                    aria-label="Retirer de la liste de souhaits"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{item.product_category}</p>
                <Link href={`/produit/${item.product_slug}`}>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {item.product_name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  {item.product_promo_price ? (
                    <>
                      <p className="font-medium text-red-600">
                        {formatPrice(item.product_promo_price)}
                      </p>
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPrice(item.product_price)}
                      </p>
                    </>
                  ) : (
                    <p className="font-medium">{formatPrice(item.product_price)}</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Stock: {item.product_stock > 0 ? `${item.product_stock} disponible(s)` : 'Rupture de stock'}
                </p>
                <Button
                  className="w-full py-2 mt-4 flex items-center justify-center gap-2"
                  onClick={() => handleAddToCart(item)}
                  disabled={item.product_stock === 0}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {item.product_stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/collections" className="btn btn-outline px-8 py-2">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}