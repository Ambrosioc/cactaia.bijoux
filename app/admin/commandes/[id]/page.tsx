'use client';

import { createClient } from '@/lib/supabase/client';
import type { Order, OrderAddress, OrderProduct } from '@/lib/supabase/types';
import { formatPrice } from '@/lib/utils';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CreditCard, Download, ExternalLink, MapPin, Package, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const { isActiveAdmin } = useUser();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (!isActiveAdmin) {
            router.push('/compte');
            return;
        }

        const loadOrder = async () => {
            try {
                const { data: orderData, error: orderError } = await supabase
                    .from('commandes')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (orderError) {
                    throw orderError;
                }

                // Récupérer les données utilisateur séparément
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('nom, prenom, email, telephone')
                    .eq('id', orderData.user_id)
                    .single();

                setOrder({
                    ...orderData,
                    users: userError ? null : userData
                });
            } catch (error) {
                console.error('Erreur lors du chargement de la commande:', error);
                setError('Commande non trouvée');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadOrder();
        }
    }, [id, isActiveAdmin, router]);

    const updateOrderStatus = async (newStatus: string) => {
        if (!order) return;

        setUpdating(true);
        try {
            const { error } = await supabase
                .from('commandes')
                .update({ statut: newStatus })
                .eq('id', order.id);

            if (error) throw error;

            setOrder({ ...order, statut: newStatus as any });
            setMessage({
                type: 'success',
                text: `Statut mis à jour: ${getStatusLabel(newStatus)}`
            });

            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Erreur mise à jour statut:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la mise à jour du statut'
            });
        } finally {
            setUpdating(false);
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

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement de la commande...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Package className="h-16 w-16 mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-medium mb-4">Commande non trouvée</h1>
                    <p className="text-muted-foreground mb-6">
                        {error || 'La commande que vous recherchez n\'existe pas.'}
                    </p>
                    <Link href="/admin/commandes" className="btn btn-primary">
                        Retour aux commandes
                    </Link>
                </div>
            </div>
        );
    }

    const products = order.produits as unknown as OrderProduct[];
    const address = order.adresse_livraison as unknown as OrderAddress;
    const user = (order as any).users;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/admin/commandes"
                        className="btn btn-outline flex items-center gap-2 px-4 py-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux commandes
                    </Link>
                    <div>
                        <h1 className="text-3xl font-medium">Commande {order.numero_commande}</h1>
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

            {/* Message de feedback */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg mb-6 ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-lg shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <User className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-medium">Informations client</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Nom complet</p>
                                <p className="font-medium">{user ? `${user.prenom} ${user.nom}` : 'Utilisateur supprimé'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{user?.email || 'Email non disponible'}</p>
                            </div>
                            {user?.telephone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Téléphone</p>
                                    <p className="font-medium">{user.telephone}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Products */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
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
                            <p className="mt-2">Téléphone: {address.telephone}</p>
                        </div>
                    </motion.div>

                    {/* Payment Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
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
                                <div className="md:col-span-2">
                                    <p className="text-muted-foreground">ID de session Stripe</p>
                                    <p className="font-mono text-xs break-all">{order.stripe_session_id}</p>
                                </div>
                            )}
                            {order.stripe_payment_intent_id && (
                                <div className="md:col-span-2">
                                    <p className="text-muted-foreground">ID Payment Intent</p>
                                    <p className="font-mono text-xs break-all">{order.stripe_payment_intent_id}</p>
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
                                            Facture PDF générée par Stripe
                                        </p>
                                    </div>
                                    <a
                                        href={order.facture_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary flex items-center gap-2 px-4 py-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Télécharger
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
                        transition={{ delay: 0.4 }}
                        className="bg-white p-6 rounded-lg shadow-sm sticky top-24"
                    >
                        <h2 className="text-xl font-medium mb-6">Actions administrateur</h2>

                        {/* Status Update */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                Changer le statut
                            </label>
                            <select
                                value={order.statut}
                                onChange={(e) => updateOrderStatus(e.target.value)}
                                disabled={updating}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="en_attente">En attente</option>
                                <option value="payee">Payée</option>
                                <option value="echouee">Échouée</option>
                                <option value="remboursee">Remboursée</option>
                                <option value="annulee">Annulée</option>
                            </select>
                            {updating && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Mise à jour en cours...
                                </p>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-3 mb-6 pt-4 border-t border-border">
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

                        {/* Order Details */}
                        <div className="space-y-3 mb-6 pt-4 border-t border-border">
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

                        {/* Actions */}
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
                                href="/admin/commandes"
                                className="w-full btn btn-outline py-2 text-center block"
                            >
                                Retour aux commandes
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
    );
}