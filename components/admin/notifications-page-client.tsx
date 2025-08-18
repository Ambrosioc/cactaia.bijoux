'use client';

import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Bell,
    Calendar,
    CheckCircle,
    CreditCard,
    DollarSign,
    Eye,
    EyeOff,
    Package,
    RefreshCw,
    Search,
    Trash2,
    User,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    created_at: string;
    read: boolean;
    action_url?: string;
    metadata?: {
        order_id?: string;
        payment_id?: string;
        amount?: number;
        customer_email?: string;
        product_id?: string;
        product_name?: string;
        current_stock?: number;
        threshold?: number;
        [key: string]: any;
    };
}

interface NotificationStats {
    total: number;
    unread: number;
    by_type: {
        success: number;
        warning: number;
        error: number;
        info: number;
    };
}

export default function NotificationsPageClient() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats>({
        total: 0,
        unread: 0,
        by_type: { success: 0, warning: 0, error: 0, info: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtres et recherche
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [readFilter, setReadFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    useEffect(() => {
        loadNotifications();
    }, [currentPage, typeFilter, readFilter, dateFilter]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString()
            });

            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (readFilter !== 'all') params.append('unread_only', readFilter === 'unread' ? 'true' : 'false');
            if (dateFilter !== 'all') params.append('period', dateFilter);

            const response = await fetch(`/api/admin/notifications?${params}`);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.notifications);
                    setStats(data.stats);
                } else {
                    setError(data.error || 'Erreur lors du chargement');
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Erreur lors du chargement');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
                method: 'POST'
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? { ...notif, read: true }
                            : notif
                    )
                );
                // Mettre à jour les stats
                setStats(prev => ({
                    ...prev,
                    unread: Math.max(0, prev.unread - 1)
                }));
            }
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/admin/notifications/mark-all-read', {
                method: 'POST'
            });

            if (response.ok) {
                setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
                setStats(prev => ({ ...prev, unread: 0 }));
            }
        } catch (error) {
            console.error('Erreur lors du marquage de tous comme lu:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) return;

        try {
            const response = await fetch(`/api/admin/notifications/${notificationId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
                // Mettre à jour les stats
                const deletedNotif = notifications.find(n => n.id === notificationId);
                if (deletedNotif && !deletedNotif.read) {
                    setStats(prev => ({
                        ...prev,
                        unread: Math.max(0, prev.unread - 1),
                        total: prev.total - 1,
                        by_type: {
                            ...prev.by_type,
                            [deletedNotif.type]: Math.max(0, prev.by_type[deletedNotif.type as keyof typeof prev.by_type] - 1)
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'info': return <CreditCard className="h-5 w-5 text-blue-500" />;
            default: return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success': return 'border-l-green-500 bg-green-50';
            case 'warning': return 'border-l-yellow-500 bg-yellow-50';
            case 'error': return 'border-l-red-500 bg-red-50';
            case 'info': return 'border-l-blue-500 bg-blue-50';
            default: return 'border-l-gray-500 bg-gray-50';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }

        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeTime = (timestamp: string) => {
        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        return date.toLocaleDateString('fr-FR');
    };

    const filteredNotifications = notifications.filter(notification => {
        const matchesSearch = searchTerm === '' ||
            notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const totalPages = Math.ceil(stats.total / itemsPerPage);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur de chargement</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadNotifications}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                            <p className="mt-2 text-gray-600">
                                Gérez toutes les notifications système de votre boutique
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadNotifications}
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Actualiser
                            </button>
                            {stats.unread > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <EyeOff className="h-4 w-4" />
                                    Tout marquer comme lu
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Bell className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Eye className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Non lues</p>
                                <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Succès</p>
                                <p className="text-2xl font-bold text-green-600">{stats.by_type.success}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Avertissements</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.by_type.warning}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtres et recherche */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recherche
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher dans les notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tous les types</option>
                                <option value="success">Succès</option>
                                <option value="warning">Avertissements</option>
                                <option value="error">Erreurs</option>
                                <option value="info">Informations</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                value={readFilter}
                                onChange={(e) => setReadFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tous</option>
                                <option value="unread">Non lues</option>
                                <option value="read">Lues</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Période
                            </label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Toute la période</option>
                                <option value="1d">Dernières 24h</option>
                                <option value="7d">Dernière semaine</option>
                                <option value="30d">Dernier mois</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Liste des notifications */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {loading ? (
                        <div className="p-8 text-center">
                            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                            <p className="text-gray-500">Chargement des notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Aucune notification trouvée</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredNotifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-6 border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {getNotificationIcon(notification.type)}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className={`text-lg font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'
                                                        }`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className={`text-gray-600 mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'
                                                        }`}>
                                                        {notification.message}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 ml-4">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Marquer comme lu"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Métadonnées */}
                                            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Détails</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                        {notification.metadata.order_id && (
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4 text-gray-400" />
                                                                <span className="text-gray-600">Commande:</span>
                                                                <span className="font-medium">{notification.metadata.order_id}</span>
                                                            </div>
                                                        )}

                                                        {notification.metadata.customer_email && (
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4 text-gray-400" />
                                                                <span className="text-gray-600">Client:</span>
                                                                <span className="font-medium">{notification.metadata.customer_email}</span>
                                                            </div>
                                                        )}

                                                        {notification.metadata.amount && (
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                                                <span className="text-gray-600">Montant:</span>
                                                                <span className="font-medium">
                                                                    {new Intl.NumberFormat('fr-FR', {
                                                                        style: 'currency',
                                                                        currency: 'EUR'
                                                                    }).format(notification.metadata.amount / 100)}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {notification.metadata.product_name && (
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4 text-gray-400" />
                                                                <span className="text-gray-600">Produit:</span>
                                                                <span className="font-medium">{notification.metadata.product_name}</span>
                                                            </div>
                                                        )}

                                                        {notification.metadata.current_stock !== undefined && (
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4 text-gray-400" />
                                                                <span className="text-gray-600">Stock:</span>
                                                                <span className="font-medium">{notification.metadata.current_stock}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatTimestamp(notification.created_at)}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <span>{formatRelativeTime(notification.created_at)}</span>
                                                </div>

                                                {notification.action_url && (
                                                    <Link
                                                        href={notification.action_url}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                                    >
                                                        Voir les détails →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Précédent
                            </button>

                            <span className="px-3 py-2 text-gray-700">
                                Page {currentPage} sur {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
