'use client';

import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign,
    Filter,
    RefreshCw,
    TrendingUp,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PaymentErrorFallback, useErrorHandler } from './error-boundary';
import Pagination from './pagination';
import PaymentCharts from './payment-charts';
import { usePaymentNotifications } from './payment-notifications';

interface Payment {
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
}

interface PaymentStats {
    total_payments: number;
    total_amount: number;
    successful_payments: number;
    failed_payments: number;
    pending_payments: number;
    canceled_payments: number;
    average_amount: number;
}

interface DailyStats {
    date: string;
    count: number;
    amount: number;
}

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export default function PaiementsClient() {
    const { isActiveAdmin } = useUser();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [periodFilter, setPeriodFilter] = useState<string>('30d');
    const [showCharts, setShowCharts] = useState(false);
    const [activeTab, setActiveTab] = useState<'payments' | 'refunds' | 'stats'>('payments');
    const [refunds, setRefunds] = useState<any[]>([]);
    const [refundLoading, setRefundLoading] = useState(false);
    const [stats, setStats] = useState<PaymentStats>({
        total_payments: 0,
        total_amount: 0,
        successful_payments: 0,
        failed_payments: 0,
        pending_payments: 0,
        canceled_payments: 0,
        average_amount: 0
    });
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 25,
        total: 0,
        total_pages: 1
    });
    const [mounted, setMounted] = useState(false);

    const { showSuccess, showError, showWarning, showInfo } = usePaymentNotifications();
    const { handleAsyncError } = useErrorHandler();

    useEffect(() => {
        setMounted(true);
    }, []);

    const loadRefunds = async () => {
        try {
            setRefundLoading(true);
            const response = await fetch('/api/admin/refunds');

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                setRefunds(data.refunds || []);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des remboursements:', error);
        } finally {
            setRefundLoading(false);
        }
    };

    useEffect(() => {
        if (mounted && isActiveAdmin) {
            loadPayments();
            loadStats();
            if (activeTab === 'refunds') {
                loadRefunds();
            }
        }
    }, [mounted, isActiveAdmin, periodFilter, pagination.page, pagination.limit, activeTab]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            setError(null);

            // Construire les paramètres de requête
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (periodFilter !== 'all') params.append('period', periodFilter);
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', pagination.page.toString());
            params.append('limit', pagination.limit.toString());

            const response = await fetch(`/api/admin/payments?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setPayments(data.payments || []);
            setPagination(prev => ({
                ...prev,
                total: data.pagination?.total || 0,
                total_pages: data.pagination?.total_pages || 1
            }));

            showSuccess(
                'Paiements chargés',
                `${data.payments?.length || 0} paiements récupérés avec succès`
            );

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            setError(errorMessage);
            showError('Erreur de chargement', `Impossible de charger les paiements: ${errorMessage}`);
            handleAsyncError(error, 'loadPayments');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            // Construire les paramètres de requête
            const params = new URLSearchParams();
            if (periodFilter !== 'all') params.append('period', periodFilter);

            const response = await fetch(`/api/admin/payments/stats?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setStats(data.stats);
            setDailyStats(data.daily_stats || []);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            showWarning('Erreur de statistiques', `Impossible de charger les statistiques: ${errorMessage}`);
            handleAsyncError(error, 'loadStats');
        }
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 })); // Retour à la première page
        loadPayments();
    };

    const handleStatusChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePeriodChange = (newPeriod: string) => {
        setPeriodFilter(newPeriod);
        setPagination(prev => ({ ...prev, page: 1 }));
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const getRefundStatusColor = (status: string) => {
        switch (status) {
            case 'succeeded':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRefundStatusLabel = (status: string) => {
        switch (status) {
            case 'succeeded':
                return 'Réussi';
            case 'pending':
                return 'En attente';
            case 'failed':
                return 'Échoué';
            default:
                return status;
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.stripe_payment_intent_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.order_number.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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

    if (error) {
        return (
            <PaymentErrorFallback
                error={new Error(error)}
                retry={() => {
                    setError(null);
                    loadPayments();
                }}
            />
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-medium mb-2">Gestion des Paiements</h1>
                    <p className="text-muted-foreground">
                        Surveillez et gérez tous les paiements de votre boutique
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCharts(!showCharts)}
                        className="btn btn-outline"
                    >
                        {showCharts ? 'Masquer' : 'Afficher'} les graphiques
                    </button>
                    <button className="btn btn-outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Exporter
                    </button>
                    <button className="btn btn-primary">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Rapports
                    </button>
                </div>
            </div>

            {/* Onglets */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payments'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Paiements
                    </button>
                    <button
                        onClick={() => setActiveTab('refunds')}
                        className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'refunds'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Remboursements
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'stats'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Statistiques
                    </button>
                </nav>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'payments' && (
                <>
                    {/* Filtres et recherche */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Rechercher par ID, email ou nom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="payee">Payé</option>
                            <option value="en_attente">En attente</option>
                            <option value="echouee">Échoué</option>
                            <option value="annulee">Annulé</option>
                        </select>
                        <select
                            value={periodFilter}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">Toutes les périodes</option>
                            <option value="7d">7 derniers jours</option>
                            <option value="30d">30 derniers jours</option>
                            <option value="90d">90 derniers jours</option>
                            <option value="1y">1 an</option>
                        </select>
                    </div>

                    {/* Liste des paiements */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Liste des paiements</h3>
                            <p className="text-sm text-gray-500">{filteredPayments.length} paiement(s) trouvé(s)</p>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Chargement des paiements...</p>
                                </div>
                            ) : filteredPayments.length === 0 ? (
                                <div className="text-center py-8">
                                    <h3 className="text-lg font-medium mb-2">Aucun paiement trouvé</h3>
                                    <p className="text-muted-foreground">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'Aucun paiement ne correspond à vos critères de recherche.'
                                            : 'Aucun paiement pour le moment.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-gray-200">
                                            <tr>
                                                <th className="text-left p-4 font-medium">Client</th>
                                                <th className="text-left p-4 font-medium">Montant</th>
                                                <th className="text-left p-4 font-medium">Statut</th>
                                                <th className="text-left p-4 font-medium">Date</th>
                                                <th className="text-left p-4 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredPayments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-gray-50">
                                                    <td className="p-4">
                                                        <div>
                                                            <div className="font-medium">{payment.customer_name}</div>
                                                            <div className="text-sm text-gray-500">{payment.customer_email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium">{formatCurrency(payment.amount)}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                            {getStatusLabel(payment.status)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {formatDate(payment.created_at)}
                                                    </td>
                                                    <td className="p-4">
                                                        <Link
                                                            href={`/admin/paiements/${payment.id}`}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        >
                                                            Voir détails
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    {filteredPayments.length > 0 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={Math.ceil(pagination.total / pagination.limit)}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}

            {activeTab === 'refunds' && (
                <div className="space-y-6">
                    {/* En-tête des remboursements */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Gestion des remboursements</h3>
                            <p className="text-sm text-gray-500">
                                Traitez les remboursements et suivez l'historique
                            </p>
                        </div>
                        <button
                            onClick={loadRefunds}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Actualiser
                        </button>
                    </div>

                    {/* Statistiques des remboursements */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total remboursé</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(refunds.filter(r => r.status === 'succeeded').reduce((sum, r) => sum + r.amount, 0))}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">En attente</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {refunds.filter(r => r.status === 'pending').length}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Échoués</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {refunds.filter(r => r.status === 'failed').length}
                                    </p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </div>
                    </div>

                    {/* Liste des remboursements */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Historique des remboursements</h3>
                            <p className="text-sm text-gray-500">{refunds.length} remboursement(s) trouvé(s)</p>
                        </div>
                        <div className="p-6">
                            {refundLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Chargement des remboursements...</p>
                                </div>
                            ) : refunds.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Aucun remboursement trouvé</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-gray-200">
                                            <tr>
                                                <th className="text-left p-3 font-medium">ID Remboursement</th>
                                                <th className="text-left p-3 font-medium">ID Paiement</th>
                                                <th className="text-left p-3 font-medium">Montant</th>
                                                <th className="text-left p-3 font-medium">Raison</th>
                                                <th className="text-left p-3 font-medium">Statut</th>
                                                <th className="text-left p-3 font-medium">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {refunds.map((refund) => (
                                                <tr key={refund.id} className="hover:bg-gray-50">
                                                    <td className="p-3">
                                                        <div className="font-mono text-sm">{refund.id}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-mono text-sm">{refund.payment_intent_id}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-medium">{formatCurrency(refund.amount)}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="text-sm">{refund.reason}</div>
                                                        {refund.metadata?.reason_detail && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {refund.metadata.reason_detail}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRefundStatusColor(refund.status)}`}>
                                                            {getRefundStatusLabel(refund.status)}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="text-sm text-gray-500">
                                                            {formatDate(refund.created_at)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'stats' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <PaymentCharts
                        stats={stats}
                        dailyStats={dailyStats}
                        period={periodFilter}
                    />
                </motion.div>
            )}
        </div>
    );
}
