"use client"

import OptimizedImage from '@/components/ui/optimized-image';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/stores/cartStore';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem
  } = useCart();

  const getImageUrl = (images: string[]): string => {
    return images?.length > 0 ? images[0] : '/placeholder.jpg';
  };

  const getPrice = (product: any) => {
    return product.prix_promo && product.prix_promo < product.prix
      ? product.prix_promo
      : product.prix;
  };

  const shipping = totalPrice > 50 ? 0 : 4.95;
  const total = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16">
        <div className="container-custom">
          <h1 className="heading-lg mb-8 text-center">Votre panier</h1>
          <div className="max-w-md mx-auto text-center py-12">
            <div className="flex justify-center mb-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-medium mb-4">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-8">
              Vous n&apos;avez pas encore ajouté d&apos;articles à votre panier. Découvrez nos collections et trouvez des bijoux qui vous ressemblent.
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
        {/* Header avec navigation */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/boutique"
            className="btn btn-outline flex items-center gap-2 px-4 py-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuer mes achats
          </Link>
          <div>
            <h1 className="heading-lg">Votre panier</h1>
            <p className="text-muted-foreground">
              {totalItems} {totalItems > 1 ? 'articles' : 'article'} dans votre panier
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="border-b border-border pb-2 mb-6 hidden md:grid grid-cols-12 text-sm font-medium">
              <div className="col-span-6">Produit</div>
              <div className="col-span-2 text-center">Quantité</div>
              <div className="col-span-2 text-center">Prix unitaire</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="space-y-6">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-border"
                >
                  {/* Mobile View */}
                  <div className="md:hidden flex space-x-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <OptimizedImage
                        src={getImageUrl(item.product.images ?? [])}
                        alt={item.product.nom}
                        fill
                        className="object-cover rounded"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-grow">
                      <Link href={`/produit/${item.product.id}`} className="font-medium hover:text-primary">
                        {item.product.nom}
                      </Link>
                      <p className="text-sm text-muted-foreground mb-1">
                        {item.product.categorie}
                      </p>
                      <p className="font-medium">{formatPrice(getPrice(item.product))}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <div className="flex items-center border border-input rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-secondary"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-secondary"
                            aria-label="Augmenter la quantité"
                            disabled={item.quantity >= (item.product.stock ?? 0)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:flex md:col-span-6 items-center space-x-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <OptimizedImage
                        src={getImageUrl(item.product.images ?? [])}
                        alt={item.product.nom}
                        fill
                        className="object-cover rounded"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <Link href={`/produit/${item.product.id}`} className="font-medium hover:text-primary">
                        {item.product.nom}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.product.categorie}
                      </p>
                      {item.product.stock && item.product.stock <= 5 && (
                        <p className="text-xs text-orange-600">
                          Plus que {item.product.stock} en stock
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="hidden md:flex md:col-span-2 justify-center">
                    <div className="flex items-center border border-input rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-secondary"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-secondary"
                        aria-label="Augmenter la quantité"
                        disabled={item.quantity >= (item.product.stock ?? 0)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="hidden md:block md:col-span-2 text-center">
                    {formatPrice(getPrice(item.product))}
                  </div>

                  <div className="hidden md:flex md:col-span-2 justify-between items-center">
                    <span className="font-medium">{formatPrice(getPrice(item.product) * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border sticky top-24">
              <h2 className="text-xl font-medium mb-6">Récapitulatif</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Sous-total ({totalItems} articles)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'Gratuite' : formatPrice(shipping)}
                  </span>
                </div>

                {/* Shipping progress */}
                {totalPrice < 50 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Plus que {formatPrice(50 - totalPrice)} pour la livraison gratuite !
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((totalPrice / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {totalPrice >= 50 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      🎉 Livraison gratuite !
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-border flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 mb-4"
              >
                Passer commande
                <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="text-xs text-muted-foreground text-center mb-4">
                Paiement sécurisé avec Stripe
              </p>

              {/* Avantages */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Livraison sous 2-3 jours ouvrés</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Retour gratuit sous 14 jours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Garantie 1 an</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6 p-4 bg-white border border-border rounded-lg shadow-sm">
              <h3 className="text-sm font-medium mb-3">Moyens de paiement acceptés</h3>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-10 h-6 bg-[#3C4B9A] rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div className="w-10 h-6 bg-[#F79F1A] rounded flex items-center justify-center text-white text-xs font-bold">
                    MC
                  </div>
                  <div className="w-10 h-6 bg-[#6772E5] rounded flex items-center justify-center text-white text-xs font-bold">
                    💳
                  </div>
                  <div className="w-10 h-6 bg-[#5B9A68] rounded flex items-center justify-center text-white text-xs font-bold">
                    🍎
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground">Sécurisé par Stripe</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}