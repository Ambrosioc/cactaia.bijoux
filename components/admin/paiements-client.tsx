'use client';

import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    Filter,
    Package,
    Search,
    TrendingUp,
    User,
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
    const [error, setError] = useState<Error | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
    const [showCharts, setShowCharts] = useState(true);
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

    useEffect(() => {
        if (mounted && isActiveAdmin) {
            loadPayments();
            loadStats();
        }
    }, [mounted, isActiveAdmin, selectedPeriod, pagination.page, pagination.limit]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            setError(null);

            // Construire les paramètres de requête
            const params = new URLSearchParams();
            if (selectedStatus !== 'all') params.append('status', selectedStatus);
            if (selectedPeriod !== 'all') params.append('period', selectedPeriod);
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
            setError(new Error(errorMessage));
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
            if (selectedPeriod !== 'all') params.append('period', selectedPeriod);

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
        setSelectedStatus(newStatus);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
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

    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.stripe_payment_intent_id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;

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
                error={error}
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

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Paiements</p>
                            <p className="text-2xl font-bold">{stats.total_payments}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Montant Total</p>
                            <p className="text-2xl font-bold">{formatAmount(stats.total_amount, 'eur')}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Paiements Réussis</p>
                            <p className="text-2xl font-bold text-green-600">{stats.successful_payments}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Montant Moyen</p>
                            <p className="text-2xl font-bold">{formatAmount(stats.average_amount, 'eur')}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Graphiques */}
            {showCharts && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <PaymentCharts
                        stats={stats}
                        dailyStats={dailyStats}
                        period={selectedPeriod}
                    />
                </motion.div>
            )}

            {/* Filtres et recherche */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher par email, nom, commande..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <select
                        value={selectedStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="succeeded">Réussis</option>
                        <option value="pending">En attente</option>
                        <option value="failed">Échoués</option>
                        <option value="canceled">Annulés</option>
                    </select>

                    <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="7d">7 derniers jours</option>
                        <option value="30d">30 derniers jours</option>
                        <option value="90d">90 derniers jours</option>
                        <option value="1y">1 an</option>
                        <option value="all">Tout</option>
                    </select>

                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Rechercher
                    </button>
                </div>
            </div>

            {/* Liste des paiements */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Chargement des paiements...</p>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="p-8 text-center">
                        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucun paiement trouvé</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || selectedStatus !== 'all'
                                ? 'Aucun paiement ne correspond à vos critères de recherche.'
                                : 'Aucun paiement pour le moment.'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Paiement
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Commande
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Montant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredPayments.map((payment, i) => (
                                        <motion.tr
                                            key={payment.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {payment.stripe_payment_intent_id.slice(-8)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {payment.payment_method}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-foreground">
                                                            {payment.customer_name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {payment.customer_email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Package className="h-4 w-4 text-muted-foreground mr-2" />
                                                    <div className="text-sm">
                                                        <div className="text-foreground font-medium">
                                                            {payment.order_number}
                                                        </div>
                                                        <div className="text-muted-foreground text-xs">
                                                            {payment.order_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-foreground">
                                                    {formatAmount(payment.amount, payment.currency)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                    {getStatusIcon(payment.status)}
                                                    <span className="ml-1">{getStatusLabel(payment.status)}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                                                    <div className="text-sm">
                                                        <div className="text-foreground">
                                                            {formatDate(payment.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/admin/paiements/${payment.id}`}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Détails
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-6 border-t border-border">
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.total_pages}
                                totalItems={pagination.total}
                                itemsPerPage={pagination.limit}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
