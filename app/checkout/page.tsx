'use client';

import { formatPrice } from '@/lib/utils';
import { useAddresses } from '@/stores/addressStore';
import { useCart } from '@/stores/cartStore';
import { useUser } from '@/stores/userStore';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Check, CreditCard, Loader2, MapPin, Package, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { user, isAuthenticated } = useUser();
    const { addresses, loadAddresses } = useAddresses();
    const primaryAddress = addresses.find(a => a.est_principale);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [applyPromoMode, setApplyPromoMode] = useState<'NONE' | 'FIELD' | 'AUTO'>('NONE');
    const [promotionCodeId, setPromotionCodeId] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/connexion');
            return;
        }

        if (items.length === 0) {
            router.push('/panier');
            return;
        }

        if (user) {
            loadAddresses(user.id);
        }
    }, [isAuthenticated, items.length, user, router, loadAddresses]);

    useEffect(() => {
        if (primaryAddress && !selectedAddressId) {
            setSelectedAddressId(primaryAddress.id);
        }
    }, [primaryAddress, selectedAddressId]);

    const getImageUrl = (images: string[]): string => {
        return images?.length > 0 ? images[0] : '/placeholder.jpg';
    };

    const getPrice = (product: any) => {
        return product.prix_promo && product.prix_promo < product.prix
            ? product.prix_promo
            : product.prix;
    };

    const shipping = totalPrice >= 50 ? 0 : 4.95;
    const total = totalPrice + shipping;

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!selectedAddressId && addresses.length === 0) {
                setError('Veuillez ajouter une adresse de livraison');
                return;
            }
            if (!selectedAddressId) {
                setError('Veuillez sélectionner une adresse de livraison');
                return;
            }
            setError(null);
            setCurrentStep(2);
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        }
    };

    const handleCheckout = async () => {
        if (!selectedAddressId) {
            setError('Veuillez sélectionner une adresse de livraison');
            return;
        }

        const isAutoPromoInvalid = applyPromoMode === 'AUTO' && (!promotionCodeId || !promotionCodeId.startsWith('promo_'));
        if (isAutoPromoInvalid) {
            setError("Veuillez saisir un identifiant Stripe valide pour le code promotionnel (ex: 'promo_...').");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items,
                    addressId: selectedAddressId,
                    mode: 'payment',
                    applyPromoMode,
                    promotionCodeId: applyPromoMode === 'AUTO' && promotionCodeId ? promotionCodeId : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
            }

            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error('Stripe non disponible');
            }

            // Rediriger vers Stripe Checkout
            const { error } = await stripe.redirectToCheckout({
                sessionId: data.sessionId,
            });

            if (error) {
                throw error;
            }

        } catch (error) {
            console.error('Erreur checkout:', error);
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-medium mb-4">Panier vide</h1>
                    <p className="text-muted-foreground mb-6">
                        Votre panier est vide. Ajoutez des produits avant de passer commande.
                    </p>
                    <Link href="/collections" className="btn btn-primary">
                        Découvrir nos produits
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gray-50">
            <div className="container-custom">
                {/* Header avec progression */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <Link
                            href="/panier"
                            className="btn btn-outline flex items-center gap-2 px-4 py-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour au panier
                        </Link>
                        <div>
                            <h1 className="text-3xl font-medium">Finaliser la commande</h1>
                            <p className="text-muted-foreground">
                                Étape {currentStep} sur 2 - {currentStep === 1 ? 'Adresse de livraison' : 'Confirmation et paiement'}
                            </p>
                        </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
                            </div>
                            <span className={`ml-2 text-sm ${currentStep >= 1 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                                Livraison
                            </span>
                        </div>
                        <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                2
                            </div>
                            <span className={`ml-2 text-sm ${currentStep >= 2 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                                Paiement
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2"
                    >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Étape 1: Adresse de livraison */}
                        {currentStep === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-6 rounded-lg shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <h2 className="text-xl font-medium">Adresse de livraison</h2>
                                    </div>
                                    {addresses.length > 0 && (
                                        <button
                                            onClick={() => setShowAddressForm(!showAddressForm)}
                                            className="btn btn-outline flex items-center gap-2 text-sm px-3 py-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Nouvelle adresse
                                        </button>
                                    )}
                                </div>

                                {addresses.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Aucune adresse enregistrée</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Ajoutez votre première adresse de livraison pour continuer
                                        </p>
                                        <Link
                                            href="/compte/mes-adresses"
                                            className="btn btn-primary"
                                        >
                                            Ajouter une adresse
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {addresses.map((address) => (
                                            <motion.label
                                                key={address.id}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedAddressId === address.id
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={address.id}
                                                    checked={selectedAddressId === address.id}
                                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-medium">{address.nom_complet}</span>
                                                            {address.est_principale && (
                                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                                    Principale
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            <p>{address.ligne_1}</p>
                                                            {address.ligne_2 && <p>{address.ligne_2}</p>}
                                                            <p>{address.code_postal} {address.ville}, {address.pays}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedAddressId === address.id
                                                        ? 'border-primary bg-primary'
                                                        : 'border-gray-300'
                                                        }`}>
                                                        {selectedAddressId === address.id && (
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.label>
                                        ))}

                                        <div className="pt-4 border-t border-gray-200">
                                            <Link
                                                href="/compte/mes-adresses"
                                                className="text-primary hover:underline text-sm flex items-center gap-1"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Gérer mes adresses
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Bouton suivant */}
                                {addresses.length > 0 && (
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleNextStep}
                                            disabled={!selectedAddressId}
                                            className="btn btn-primary px-8 py-3 flex items-center gap-2"
                                        >
                                            Continuer vers le paiement
                                            <ArrowLeft className="h-4 w-4 rotate-180" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Étape 2: Confirmation et paiement */}
                        {currentStep === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                {/* Récapitulatif adresse */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <h3 className="text-lg font-medium">Adresse de livraison</h3>
                                        </div>
                                        <button
                                            onClick={handlePrevStep}
                                            className="text-primary hover:underline text-sm"
                                        >
                                            Modifier
                                        </button>
                                    </div>
                                    {selectedAddressId && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            {(() => {
                                                const address = addresses.find(a => a.id === selectedAddressId);
                                                return address ? (
                                                    <div className="text-sm">
                                                        <p className="font-medium">{address.nom_complet}</p>
                                                        <p>{address.ligne_1}</p>
                                                        {address.ligne_2 && <p>{address.ligne_2}</p>}
                                                        <p>{address.code_postal} {address.ville}, {address.pays}</p>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Méthode de paiement */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-2 mb-6">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-medium">Méthode de paiement</h3>
                                    </div>

                                    <div className="p-4 border-2 border-primary/20 bg-primary/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#6772E5] rounded-lg flex items-center justify-center">
                                                <span className="text-white text-sm font-bold">S</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Paiement sécurisé par Stripe</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Carte bancaire, Apple Pay, Google Pay
                                                </p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Options de code promo (léger, sans modifier la charte) */}
                                    <div className="mt-6">
                                        <h4 className="text-sm font-medium mb-2">Code promotionnel</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <label className={`flex items-center gap-2 p-3 rounded border ${applyPromoMode === 'NONE' ? 'border-primary' : 'border-border'}`}>
                                                <input
                                                    type="radio"
                                                    name="promoMode"
                                                    value="NONE"
                                                    checked={applyPromoMode === 'NONE'}
                                                    onChange={() => setApplyPromoMode('NONE')}
                                                />
                                                <span className="text-sm">Aucun</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-3 rounded border ${applyPromoMode === 'FIELD' ? 'border-primary' : 'border-border'}`}>
                                                <input
                                                    type="radio"
                                                    name="promoMode"
                                                    value="FIELD"
                                                    checked={applyPromoMode === 'FIELD'}
                                                    onChange={() => setApplyPromoMode('FIELD')}
                                                />
                                                <span className="text-sm">Saisie sur Checkout</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-3 rounded border ${applyPromoMode === 'AUTO' ? 'border-primary' : 'border-border'}`}>
                                                <input
                                                    type="radio"
                                                    name="promoMode"
                                                    value="AUTO"
                                                    checked={applyPromoMode === 'AUTO'}
                                                    onChange={() => setApplyPromoMode('AUTO')}
                                                />
                                                <span className="text-sm">Appliquer automatiquement</span>
                                            </label>
                                        </div>
                                        {applyPromoMode === 'AUTO' && (
                                            <div className="mt-3">
                                                <input
                                                    type="text"
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                    placeholder="ID du code promotionnel (promo_...)"
                                                    value={promotionCodeId}
                                                    onChange={(e) => setPromotionCodeId(e.target.value)}
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Utilisez l’identifiant Stripe du promotion code (ex: promo_...). Le champ de saisie restera disponible sur Checkout.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 text-xs text-muted-foreground">
                                        🔒 Vos informations de paiement sont sécurisées et chiffrées
                                    </div>
                                </div>

                                {/* Boutons de navigation */}
                                <div className="flex justify-between">
                                    <button
                                        onClick={handlePrevStep}
                                        className="btn btn-outline px-6 py-3 flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Retour
                                    </button>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={loading || !selectedAddressId}
                                        className="btn btn-primary px-8 py-3 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Redirection...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-4 w-4" />
                                                Payer {formatPrice(total)}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar - Récapitulatif commande */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                            <h2 className="text-xl font-medium mb-6">Récapitulatif</h2>

                            {/* Items */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-3">
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            <Image
                                                src={getImageUrl(item.product.images ?? [])}
                                                alt={item.product.nom}
                                                fill
                                                className="object-cover rounded"
                                            />
                                            <div className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.product.nom}</p>
                                            <p className="text-xs text-muted-foreground">{item.product.categorie}</p>
                                        </div>
                                        <p className="text-sm font-medium">
                                            {formatPrice(getPrice(item.product) * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 pt-4 border-t border-border">
                                <div className="flex justify-between text-sm">
                                    <span>Sous-total</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Livraison</span>
                                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                                        {shipping === 0 ? 'Gratuite' : formatPrice(shipping)}
                                    </span>
                                </div>
                                {shipping === 0 && totalPrice >= 50 && (
                                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                                        🎉 Livraison gratuite !
                                    </div>
                                )}
                                {shipping > 0 && (
                                    <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                                        💡 Plus que {formatPrice(50 - totalPrice)} pour la livraison gratuite
                                    </div>
                                )}
                                <div className="flex justify-between font-medium text-lg pt-3 border-t border-border">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>

                            {/* Informations supplémentaires */}
                            <div className="mt-6 space-y-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Paiement 100% sécurisé</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Livraison sous 2-3 jours ouvrés</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Retour gratuit sous 14 jours</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-border">
                                <p className="text-xs text-muted-foreground text-center">
                                    En passant commande, vous acceptez nos{' '}
                                    <Link href="/cgv" className="text-primary hover:underline">
                                        conditions générales de vente
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}