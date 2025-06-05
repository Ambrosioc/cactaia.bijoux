"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { products } from '@/lib/data/products';
import { motion } from 'framer-motion';

// Sample cart items for demonstration
const initialCartItems = [
  {
    id: '1',
    product: products[0],
    quantity: 1,
    color: 'gold',
    size: undefined,
  },
  {
    id: '2',
    product: products[1],
    quantity: 1,
    color: 'silver',
    size: undefined,
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };
  
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );
  
  const shipping = subtotal > 50 ? 0 : 4.95;
  const total = subtotal + shipping;
  
  if (cartItems.length === 0) {
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
              Vous n'avez pas encore ajouté d'articles à votre panier. Découvrez nos collections et trouvez des bijoux qui vous ressemblent.
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
        <h1 className="heading-lg mb-8">Votre panier</h1>
        
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
              {cartItems.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-4 border-b border-border"
                >
                  {/* Mobile View */}
                  <div className="md:hidden flex space-x-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <Link href={`/produit/${item.product.slug}`} className="font-medium hover:text-primary">
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mb-1">
                        Couleur: {item.color}
                        {item.size && `, Taille: ${item.size}`}
                      </p>
                      <p className="font-medium">{formatPrice(item.product.price)}</p>
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
                      <Image 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <Link href={`/produit/${item.product.slug}`} className="font-medium hover:text-primary">
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Couleur: {item.color}
                        {item.size && `, Taille: ${item.size}`}
                      </p>
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
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="hidden md:block md:col-span-2 text-center">
                    {formatPrice(item.product.price)}
                  </div>
                  
                  <div className="hidden md:flex md:col-span-2 justify-between items-center">
                    <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
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
            
            <div className="mt-8">
              <Link href="/boutique" className="inline-flex items-center text-primary hover:underline">
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Continuer mes achats
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-secondary p-6 rounded-lg">
              <h2 className="text-xl font-medium mb-4">Récapitulatif</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{shipping === 0 ? 'Gratuite' : formatPrice(shipping)}</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <Link 
                href="/checkout" 
                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
              >
                Passer commande
              </Link>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Livraison gratuite en France métropolitaine à partir de 50€ d'achat
              </p>
            </div>
            
            {/* Payment Methods */}
            <div className="mt-6 p-4 border border-border rounded-lg">
              <h3 className="text-sm font-medium mb-3">Moyens de paiement acceptés</h3>
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <div className="w-10 h-6 bg-[#3C4B9A] rounded"></div>
                  <div className="w-10 h-6 bg-[#F79F1A] rounded"></div>
                  <div className="w-10 h-6 bg-[#6772E5] rounded"></div>
                  <div className="w-10 h-6 bg-[#5B9A68] rounded"></div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground">Paiement sécurisé</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}