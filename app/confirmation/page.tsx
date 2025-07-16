'use client';

import { createClient } from '@/lib/supabase/client';
import type { Order, OrderAddress, OrderProduct } from '@/lib/supabase/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/stores/cartStore';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, CreditCard, MapPin, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { clearCart } = useCart();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (sessionId) {
            loadOrderFromSession();
            // Vider le panier après confirmation
            clearCart();
        } else {
            setError('Session de paiement non trouvée');
            setLoading(false);
        }
    }, [sessionId, clearCart]);

    const loadOrderFromSession = async () => {
        if (!sessionId) {
            setError('Session de paiement non trouvée');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('commandes')
                .select('*')
                .eq('stripe_session_id', sessionId)
                .single();

            if (error) {
                throw error;
            }

            if (data) {
                setOrder(data);

                // Mettre à jour le statut de la commande si nécessaire
                if (data.statut === 'en_attente') {
                    await supabase
                        .from('commandes')
                        .update({ statut: 'payee' })
                        .eq('id', data.id);

                    setOrder({ ...data, statut: 'payee' });
                }
            } else {
                setError('Commande non trouvée');
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la commande:', error);
            setError('Erreur lors du chargement de la commande');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (image: string | null): string => {
        return image || '/placeholder.jpg';
    };

    if (loading) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement de votre commande...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-medium mb-4">Erreur</h1>
                    <p className="text-muted-foreground mb-6">
                        {error || 'Commande non trouvée'}
                    </p>
                    <Link href="/boutique" className="btn btn-primary">
                        Retour au shop
                    </Link>
                </div>
            </div>
        );
    }

    const products = order.produits as unknown as OrderProduct[];
    const address = order.adresse_livraison as unknown as OrderAddress;

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gray-50">
            <div className="container-custom">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-medium mb-4">Commande confirmée !</h1>
                    <p className="text-muted-foreground text-lg">
                        Merci pour votre commande. Vous recevrez un email de confirmation sous peu.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Package className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-medium">Détails de la commande</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-sm text-muted-foreground">Numéro de commande</p>
                                    <p className="font-medium">{order.numero_commande}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date de commande</p>
                                    <p className="font-medium">
                                        {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'Date non disponible'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Statut</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {order.statut === 'payee' ? 'Payée' : order.statut}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Montant total</p>
                                    <p className="font-medium text-lg">{formatPrice(order.montant_total)}</p>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="space-y-4">
                                <h3 className="font-medium">Produits commandés</h3>
                                {products.map((product, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="relative w-16 h-16 flex-shrink-0">
                                            <Image
                                                src={getImageUrl(product?.image || '')}
                                                alt={product.nom}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{product.nom}</h4>
                                            {product.sku && (
                                                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                Quantité: {product.quantite}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatPrice(product.prix)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Total: {formatPrice(product.prix * product.quantite)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Shipping Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-medium">Adresse de livraison</h2>
                            </div>

                            <div className="text-sm">
                                <p className="font-medium">{address.nom_complet}</p>
                                <p>{address.ligne_1}</p>
                                {address.ligne_2 && <p>{address.ligne_2}</p>}
                                <p>{address.code_postal} {address.ville}</p>
                                <p>{address.pays}</p>

                            </div>
                        </motion.div>

                        {/* Payment Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-medium">Méthode de paiement</h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#6772E5] rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">S</span>
                                </div>
                                <div>
                                    <p className="font-medium">Paiement par carte bancaire</p>
                                    <p className="text-sm text-muted-foreground">Sécurisé par Stripe</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-6 rounded-lg shadow-sm sticky top-24"
                        >
                            <h2 className="text-xl font-medium mb-6">Prochaines étapes</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Commande confirmée</p>
                                        <p className="text-xs text-muted-foreground">
                                            Votre paiement a été traité avec succès
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Package className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Préparation</p>
                                        <p className="text-xs text-muted-foreground">
                                            Votre commande est en cours de préparation
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-medium text-gray-600">3</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Expédition</p>
                                        <p className="text-xs text-muted-foreground">
                                            Vous recevrez un email de suivi
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    href="/compte/commandes"
                                    className="w-full btn btn-primary py-2 flex items-center justify-center gap-2"
                                >
                                    Voir mes commandes
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <Link
                                    href="/boutique"
                                    className="w-full btn btn-outline py-2 text-center block"
                                >
                                    Continuer mes achats
                                </Link>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800 font-medium mb-1">
                                    Besoin d&apos;aide ?
                                </p>
                                <p className="text-xs text-blue-700 mb-3">
                                    Notre équipe est là pour vous accompagner
                                </p>
                                <Link
                                    href="/contact"
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Nous contacter
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        }>
            <ConfirmationContent />
        </Suspense>
    );
}