'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Bell,
    CheckCircle,
    CreditCard,
    RefreshCw,
    X,
    XCircle
} from 'lucide-react';
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

export default function NotificationsPanel() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats>({
        total: 0,
        unread: 0,
        by_type: { success: 0, warning: 0, error: 0, info: 0 }
    });
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNotifications();
        // Polling toutes les 30 secondes pour les nouvelles notifications
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/notifications');

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.notifications);
                    setStats(data.stats);
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
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

        // Vérifier que la date est valide
        if (isNaN(date.getTime())) {
            console.warn('Date invalide:', timestamp);
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

    return (
        <div className="relative">
            {/* Bouton de notifications */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <Bell className="h-6 w-6" />
                {stats.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {stats.unread > 99 ? '99+' : stats.unread}
                    </span>
                )}
            </button>

            {/* Panel de notifications */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    >
                        {/* En-tête */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div>
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                <p className="text-sm text-gray-500">
                                    {stats.unread} non lue{stats.unread > 1 ? 's' : ''} sur {stats.total}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={loadNotifications}
                                    disabled={loading}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                {stats.unread > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        Tout marquer comme lu
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Statistiques rapides */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>{stats.by_type.success}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span>{stats.by_type.warning}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span>{stats.by_type.error}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>{stats.by_type.info}</span>
                                </div>
                            </div>
                        </div>

                        {/* Liste des notifications */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>Aucune notification</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {getNotificationIcon(notification.type)}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'
                                                            }`}>
                                                            {notification.title}
                                                        </h4>
                                                        <button
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'
                                                        }`}>
                                                        {notification.message}
                                                    </p>

                                                    {/* Métadonnées */}
                                                    {notification.metadata && (
                                                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                                                            {notification.metadata.order_id && (
                                                                <div>Commande: {notification.metadata.order_id}</div>
                                                            )}
                                                            {notification.metadata.customer_email && (
                                                                <div>Client: {notification.metadata.customer_email}</div>
                                                            )}
                                                            {notification.metadata.amount && (
                                                                <div>Montant: {new Intl.NumberFormat('fr-FR', {
                                                                    style: 'currency',
                                                                    currency: 'EUR'
                                                                }).format(notification.metadata.amount / 100)}</div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-gray-400">
                                                            {formatTimestamp(notification.created_at)}
                                                        </span>
                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-xs text-blue-600 hover:text-blue-800"
                                                            >
                                                                Marquer comme lu
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pied de page */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => window.open('/admin/notifications', '_blank')}
                                    className="w-full text-sm text-blue-600 hover:text-blue-800 text-center"
                                >
                                    Voir toutes les notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay pour fermer en cliquant à l'extérieur */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
