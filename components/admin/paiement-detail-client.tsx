'use client';

import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    CreditCard,
    Package,
    RefreshCw,
    User,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PaymentDetail {
    id: string;
    order_id: string;
    user_id: string;
    montant_total: number;
    statut: string;
    created_at: string;
    updated_at: string;
    stripe_payment_intent_id?: string;
    stripe_payment_method?: string;
    customer?: {
        email: string;
        nom: string;
        prenom: string;
    };
    order?: {
        numero: string;
        produits: Array<{
            nom: string;
            quantite: number;
            prix: number;
        }>;
    };
}

interface Refund {
    id: string;
    payment_intent_id: string;
    amount: number;
    currency: string;
    reason: string;
    status: 'succeeded' | 'pending' | 'failed' | 'canceled';
    created_at: string;
    metadata?: {
        reason_detail?: string;
    };
}

export default function PaiementDetailClient() {
    const params = useParams();
    const paymentId = params.id as string;

    const [payment, setPayment] = useState<PaymentDetail | null>(null);
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showRefundForm, setShowRefundForm] = useState(false);
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [refundReason, setRefundReason] = useState<string>('');
    const [refundReasonDetail, setRefundReasonDetail] = useState<string>('');
    const [processingRefund, setProcessingRefund] = useState(false);

    useEffect(() => {
        if (paymentId) {
            loadPaymentDetail();
            loadRefunds();
        }
    }, [paymentId]);

    const loadPaymentDetail = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/payments/${paymentId}`);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                setPayment(data.payment);
            } else {
                throw new Error(data.error || 'Erreur lors du chargement du paiement');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    const loadRefunds = async () => {
        try {
            const response = await fetch('/api/admin/refunds');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Filtrer les remboursements pour ce paiement
                    const paymentRefunds = data.refunds.filter((refund: Refund) =>
                        refund.payment_intent_id === payment?.stripe_payment_intent_id
                    );
                    setRefunds(paymentRefunds);
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des remboursements:', error);
        }
    };

    const processRefund = async () => {
        if (!payment || !refundAmount || !refundReason) {
            alert('Veuillez remplir tous les champs requis');
            return;
        }

        if (refundAmount > payment.montant_total * 100) { // Convertir en centimes
            alert('Le montant du remboursement ne peut pas dépasser le montant du paiement');
            return;
        }

        try {
            setProcessingRefund(true);

            const response = await fetch('/api/admin/refunds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_id: payment.order_id,
                    amount: refundAmount,
                    reason: refundReason,
                    reason_detail: refundReasonDetail,
                    currency: 'eur'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors du traitement du remboursement');
            }

            const result = await response.json();
            alert(`Remboursement traité avec succès ! ID: ${result.refund_id}`);

            // Réinitialiser le formulaire
            setRefundAmount(0);
            setRefundReason('');
            setRefundReasonDetail('');
            setShowRefundForm(false);

            // Actualiser les données
            await loadPaymentDetail();
            await loadRefunds();

        } catch (err) {
            alert(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        } finally {
            setProcessingRefund(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount / 100); // Stripe utilise les centimes
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'payee': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'en_attente': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'echouee': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'annulee': return <XCircle className="h-5 w-5 text-gray-500" />;
            case 'rembourse': return <RefreshCw className="h-5 w-5 text-blue-500" />;
            default: return <AlertTriangle className="h-5 w-5 text-orange-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'payee': return 'bg-green-100 text-green-800';
            case 'en_attente': return 'bg-yellow-100 text-yellow-800';
            case 'echouee': return 'bg-red-100 text-red-800';
            case 'annulee': return 'bg-gray-100 text-gray-800';
            case 'rembourse': return 'bg-blue-100 text-blue-800';
            default: return 'bg-orange-100 text-orange-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'payee': return 'Payé';
            case 'en_attente': return 'En attente';
            case 'echouee': return 'Échoué';
            case 'annulee': return 'Annulé';
            case 'rembourse': return 'Remboursé';
            default: return status;
        }
    };

    const getRefundStatusColor = (status: string) => {
        switch (status) {
            case 'succeeded': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'canceled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-orange-100 text-orange-800';
        }
    };

    const getRefundStatusLabel = (status: string) => {
        switch (status) {
            case 'succeeded': return 'Réussi';
            case 'pending': return 'En attente';
            case 'failed': return 'Échoué';
            case 'canceled': return 'Annulé';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !payment) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Paiement non trouvé'}</p>
                    <Link
                        href="/admin/paiements"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Retour aux paiements
                    </Link>
                </div>
            </div>
        );
    }

    const totalRefunded = refunds
        .filter(refund => refund.status === 'succeeded')
        .reduce((sum, refund) => sum + refund.amount, 0);

    const canRefund = payment.statut === 'payee' && totalRefunded < payment.montant_total * 100;

    return (
        <div className="space-y-6">
            {/* En-tête avec bouton retour */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/paiements"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux paiements
                    </Link>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <h1 className="text-2xl font-bold">Détails du paiement #{payment.id}</h1>
                </div>
                <button
                    onClick={() => {
                        loadPaymentDetail();
                        loadRefunds();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Actualiser
                </button>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Détails du paiement */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Informations du paiement
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">ID du paiement</label>
                                <p className="font-mono text-sm">{payment.id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">ID Stripe</label>
                                <p className="font-mono text-sm">{payment.stripe_payment_intent_id || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Montant</label>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(payment.montant_total * 100)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Statut</label>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(payment.statut)}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.statut)}`}>
                                        {getStatusLabel(payment.statut)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Date de création</label>
                                <p className="text-sm">{formatDate(payment.created_at)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Dernière mise à jour</label>
                                <p className="text-sm">{formatDate(payment.updated_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Informations client */}
                    {payment.customer && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informations client
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Nom complet</label>
                                    <p className="font-medium">{payment.customer.prenom} {payment.customer.nom}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                    <p className="text-sm">{payment.customer.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Détails de la commande */}
                    {payment.order && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Détails de la commande #{payment.order.numero}
                            </h2>
                            <div className="space-y-3">
                                {payment.order.produits.map((produit, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium">{produit.nom}</div>
                                            <div className="text-sm text-gray-500">Quantité: {produit.quantite}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{formatCurrency(produit.prix * 100)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions et remboursements */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">Actions</h3>
                        <div className="space-y-3">
                            {canRefund && (
                                <button
                                    onClick={() => setShowRefundForm(!showRefundForm)}
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    Traiter un remboursement
                                </button>
                            )}
                            {!canRefund && (
                                <div className="text-sm text-gray-500 text-center py-2">
                                    {payment.statut === 'payee'
                                        ? 'Remboursement complet effectué'
                                        : 'Ce paiement ne peut pas être remboursé'
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Remboursements */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">Remboursements</h3>
                        {refunds.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Aucun remboursement</p>
                        ) : (
                            <div className="space-y-3">
                                {refunds.map((refund) => (
                                    <div key={refund.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm font-medium">{refund.id.slice(-8)}</div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRefundStatusColor(refund.status)}`}>
                                                {getRefundStatusLabel(refund.status)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <div>Montant: {formatCurrency(refund.amount)}</div>
                                            <div>Raison: {refund.reason}</div>
                                            {refund.metadata?.reason_detail && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {refund.metadata.reason_detail}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-400 mt-1">
                                                {formatDate(refund.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Résumé des remboursements */}
                    {refunds.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold mb-4">Résumé</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Montant total:</span>
                                    <span className="font-medium">{formatCurrency(payment.montant_total * 100)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Remboursé:</span>
                                    <span className="font-medium text-red-600">-{formatCurrency(totalRefunded)}</span>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Solde:</span>
                                        <span className="font-medium">
                                            {formatCurrency((payment.montant_total * 100) - totalRefunded)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Formulaire de remboursement */}
            {showRefundForm && canRefund && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border p-6"
                >
                    <h3 className="text-lg font-semibold mb-4">Traiter un remboursement</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Montant du remboursement
                                </label>
                                <input
                                    type="number"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                                    max={(payment.montant_total * 100) - totalRefunded}
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Montant en centimes"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Montant maximum: {formatCurrency((payment.montant_total * 100) - totalRefunded)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Raison du remboursement
                                </label>
                                <select
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Sélectionner une raison</option>
                                    <option value="duplicate">Transaction dupliquée</option>
                                    <option value="fraudulent">Transaction frauduleuse</option>
                                    <option value="requested_by_customer">Demandé par le client</option>
                                    <option value="defective_product">Produit défectueux</option>
                                    <option value="not_received">Produit non reçu</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Détails supplémentaires (optionnel)
                            </label>
                            <textarea
                                value={refundReasonDetail}
                                onChange={(e) => setRefundReasonDetail(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Détails sur le remboursement..."
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRefundForm(false);
                                    setRefundAmount(0);
                                    setRefundReason('');
                                    setRefundReasonDetail('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={processRefund}
                                disabled={processingRefund || !refundAmount || !refundReason}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                            >
                                {processingRefund ? 'Traitement...' : 'Traiter le remboursement'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
