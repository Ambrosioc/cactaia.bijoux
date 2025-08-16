'use client';

import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    Copy,
    CreditCard,
    Download,
    ExternalLink,
    Eye,
    Mail,
    MapPin,
    Package,
    RefreshCw,
    User,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PaymentDetail {
    id: string;
    stripe_payment_intent_id: string;
    amount: number;
    currency: string;
    status: 'succeeded' | 'pending' | 'failed' | 'canceled';
    payment_method: string;
    customer_email: string;
    customer_name: string;
    order_id: string;
    order_number: string;
    created_at: string;
    updated_at: string;
    metadata: {
        order_id?: string;
        customer_id?: string;
        [key: string]: any;
    };
    // Données Stripe
    stripe_data: {
        payment_intent: any;
        customer: any;
        payment_method_details: any;
        charges: any[];
        refunds: any[];
    };
    // Données commande
    order_data: {
        id: string;
        numero_commande: string;
        statut: string;
        montant_total: number;
        produits: any[];
        adresse_livraison: any;
        adresse_facturation: any;
        created_at: string;
        updated_at: string;
    };
}

export default function PaiementDetailClient({ paymentId }: { paymentId: string }) {
    const { isActiveAdmin } = useUser();
    const [payment, setPayment] = useState<PaymentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && isActiveAdmin) {
            loadPaymentDetail();
        }
    }, [mounted, isActiveAdmin, paymentId]);

    const loadPaymentDetail = async () => {
        try {
            setLoading(true);

            const response = await fetch(`/api/admin/payments/${paymentId}`);
            if (response.ok) {
                const data = await response.json();
                setPayment(data.payment);
            } else {
                console.error('Erreur lors du chargement du paiement:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur lors du chargement du paiement:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'succeeded':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'canceled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'failed':
                return <XCircle className="h-4 w-4" />;
            case 'canceled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'succeeded':
                return 'Réussi';
            case 'pending':
                return 'En attente';
            case 'failed':
                return 'Échoué';
            case 'canceled':
                return 'Annulé';
            default:
                return status;
        }
    };

    const formatAmount = (amount: number, currency: string) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // TODO: Ajouter une notification de succès
    };

    if (!mounted) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    if (!isActiveAdmin) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-medium mb-4">Accès non autorisé</h1>
                <p className="text-muted-foreground">
                    Vous devez être administrateur pour accéder à cette page.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement du paiement...</p>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-medium mb-4">Paiement non trouvé</h1>
                <p className="text-muted-foreground">
                    Le paiement demandé n'existe pas ou a été supprimé.
                </p>
                <Link href="/admin/paiements" className="btn btn-primary mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour aux paiements
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header avec navigation */}
            <div className="mb-8">
                <Link
                    href="/admin/paiements"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour aux paiements
                </Link>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-medium mb-2">Détail du Paiement</h1>
                        <p className="text-muted-foreground">
                            Paiement {payment.stripe_payment_intent_id.slice(-8)} - {payment.order_number}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualiser
                        </button>
                        <button className="btn btn-primary">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                        </button>
                    </div>
                </div>
            </div>

            {/* Statut du paiement */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-sm border mb-8"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium">Statut du Paiement</h2>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-2">{getStatusLabel(payment.status)}</span>
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Montant</p>
                        <p className="text-2xl font-bold">{formatAmount(payment.amount, payment.currency)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Méthode de paiement</p>
                        <p className="text-lg font-medium capitalize">{payment.payment_method}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Date de création</p>
                        <p className="text-lg font-medium">{formatDate(payment.created_at)}</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations Stripe */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            Informations Stripe
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Payment Intent ID</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono">{payment.stripe_payment_intent_id}</span>
                                    <button
                                        onClick={() => copyToClipboard(payment.stripe_payment_intent_id)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Customer ID</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono">{payment.stripe_data.customer.id}</span>
                                    <button
                                        onClick={() => copyToClipboard(payment.stripe_data.customer.id)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Méthode de paiement</span>
                                <span className="text-sm font-medium">
                                    {payment.stripe_data.payment_method_details.card.brand.toUpperCase()}
                                    •••• {payment.stripe_data.payment_method_details.card.last4}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Expiration</span>
                                <span className="text-sm font-medium">
                                    {payment.stripe_data.payment_method_details.card.exp_month}/{payment.stripe_data.payment_method_details.card.exp_year}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-green-600" />
                            Informations Client
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Nom</span>
                                <span className="text-sm font-medium">{payment.stripe_data.customer.name}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Email</span>
                                <span className="text-sm font-medium">{payment.stripe_data.customer.email}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Téléphone</span>
                                <span className="text-sm font-medium">{payment.stripe_data.customer.phone}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Client depuis</span>
                                <span className="text-sm font-medium">
                                    {formatDate(new Date(payment.stripe_data.customer.created * 1000).toISOString())}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Informations Commande */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Package className="h-5 w-5 text-purple-600" />
                            Détails de la Commande
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Numéro de commande</span>
                                <span className="text-sm font-medium">{payment.order_data.numero_commande}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Statut</span>
                                <span className="text-sm font-medium capitalize">{payment.order_data.statut}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Montant total</span>
                                <span className="text-sm font-medium">{formatAmount(payment.order_data.montant_total, 'eur')}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Date de création</span>
                                <span className="text-sm font-medium">{formatDate(payment.order_data.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium mb-4">Produits commandés</h3>

                        <div className="space-y-3">
                            {payment.order_data.produits.map((product, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <p className="text-sm font-medium">{product.nom}</p>
                                        <p className="text-xs text-muted-foreground">{product.variante}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{formatAmount(product.prix, 'eur')}</p>
                                        <p className="text-xs text-muted-foreground">Qté: {product.quantite}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-orange-600" />
                            Adresse de livraison
                        </h3>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">{payment.order_data.adresse_livraison.nom}</p>
                            <p className="text-sm text-muted-foreground">{payment.order_data.adresse_livraison.adresse}</p>
                            {payment.order_data.adresse_livraison.complement && (
                                <p className="text-sm text-muted-foreground">{payment.order_data.adresse_livraison.complement}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                {payment.order_data.adresse_livraison.code_postal} {payment.order_data.adresse_livraison.ville}
                            </p>
                            <p className="text-sm text-muted-foreground">{payment.order_data.adresse_livraison.pays}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 bg-white p-6 rounded-lg shadow-sm border"
            >
                <h3 className="text-lg font-medium mb-4">Actions</h3>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href={`/admin/commandes/${payment.order_data.id}`}
                        className="btn btn-outline"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir la commande
                    </Link>

                    <a
                        href={`https://dashboard.stripe.com/payments/${payment.stripe_payment_intent_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Voir dans Stripe
                    </a>

                    <button className="btn btn-outline">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger la facture
                    </button>

                    <button className="btn btn-outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer par email
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
