'use client';

import { createClient } from '@/lib/supabase/client';
import type { Order, OrderAddress, OrderProduct } from '@/lib/supabase/types';
import { formatPrice } from '@/lib/utils';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CreditCard, Download, ExternalLink, MapPin, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrderDetailPage() {
    const { id } = useParams();
    const {
        user,
        isAuthenticated,
        isActiveUser,
        loading: userLoading
    } = useUser();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAccess = async () => {
            if (userLoading) return;

            if (!isAuthenticated) {
                router.push('/connexion');
                return;
            }

            if (!user) {
                return;
            }

            if (!isActiveUser) {
                router.push('/admin');
                return;
            }

            await loadOrder();
            setLoading(false);
        };

        checkAccess();
    }, [isAuthenticated, user, isActiveUser, userLoading, router, id]);

    const loadOrder = async () => {
        if (!user || !id) return;

        try {
            const { data, error } = await supabase
                .from('commandes')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (error) {
                throw error;
            }

            setOrder(data);
        } catch (error) {
            console.error('Erreur lors du chargement de la commande:', error);
            setError('Commande non trouvée');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'payee':
                return 'bg-green-100 text-green-800';
            case 'en_attente':
                return 'bg-yellow-100 text-yellow-800';
            case 'echouee':
                return 'bg-red-100 text-red-800';
            case 'remboursee':
                return 'bg-blue-100 text-blue-800';
            case 'annulee':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'payee':
                return 'Payée';
            case 'en_attente':
                return 'En attente';
            case 'echouee':
                return 'Échouée';
            case 'remboursee':
                return 'Remboursée';
            case 'annulee':
                return 'Annulée';
            default:
                return status;
        }
    };

    const getImageUrl = (image: string | null): string => {
        return image || '/placeholder.jpg';
    };

    if (loading || userLoading || !user) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-medium mb-4">Commande non trouvée</h1>
                    <p className="text-muted-foreground mb-6">
                        {error || 'La commande que vous recherchez n\'existe pas.'}
                    </p>
                    <Link href="/compte" className="btn btn-primary">
                        Retour aux commandes
                    </Link>
                </div>
            </div>
        );
    }

    const products = order.produits as unknown as OrderProduct[];
    const address = order.adresse_livraison as unknown as OrderAddress;

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-primary/5 to-secondary">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/compte"
                            className="btn btn-outline flex items-center gap-2 px-4 py-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour aux commandes
                        </Link>
                        <div>
                            <h1 className="heading-lg">Commande {order.numero_commande}</h1>
                            <p className="text-muted-foreground">
                                Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.statut)}`}>
                            {getStatusLabel(order.statut)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Products */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Package className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-medium">Produits commandés</h2>
                            </div>

                            <div className="space-y-4">
                                {products.map((product, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
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
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Prix unitaire: {formatPrice(product.prix)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Quantité: {product.quantite}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatPrice(product.prix * product.quantite)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Shipping Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
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
                                <p className="mt-2">Téléphone: {address.telephone}</p>
                            </div>
                        </motion.div>

                        {/* Payment Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-medium">Informations de paiement</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Méthode de paiement</p>
                                    <p className="font-medium">Carte bancaire (Stripe)</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Montant total</p>
                                    <p className="font-medium">{formatPrice(order.montant_total)}</p>
                                </div>
                                {order.stripe_session_id && (
                                    <div>
                                        <p className="text-muted-foreground">ID de session</p>
                                        <p className="font-mono text-xs">{order.stripe_session_id}</p>
                                    </div>
                                )}
                            </div>

                            {/* Facture */}
                            {order.facture_url && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-blue-800">Facture disponible</p>
                                            <p className="text-sm text-blue-600">
                                                Téléchargez votre facture PDF
                                            </p>
                                        </div>
                                        <a
                                            href={order.facture_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary flex items-center gap-2 px-4 py-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Télécharger la facture
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-lg shadow-sm sticky top-24"
                        >
                            <h2 className="text-xl font-medium mb-6">Récapitulatif</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span>Sous-total</span>
                                    <span>{formatPrice(order.montant_total - (order.montant_total >= 50 ? 0 : 4.95))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Livraison</span>
                                    <span>{order.montant_total >= 50 ? 'Gratuite' : formatPrice(4.95)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-lg pt-3 border-t border-border">
                                    <span>Total</span>
                                    <span>{formatPrice(order.montant_total)}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Commande passée le</span>
                                </div>
                                <p className="text-sm font-medium">
                                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {order.facture_url && (
                                    <a
                                        href={order.facture_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full btn btn-primary py-2 flex items-center justify-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Télécharger la facture
                                    </a>
                                )}

                                <Link
                                    href="/contact"
                                    className="w-full btn btn-outline py-2 text-center block"
                                >
                                    Contacter le support
                                </Link>

                                <Link
                                    href="/boutique"
                                    className="w-full btn btn-outline py-2 text-center block"
                                >
                                    Continuer mes achats
                                </Link>
                            </div>

                            {order.notes && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium mb-1">Notes</p>
                                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}