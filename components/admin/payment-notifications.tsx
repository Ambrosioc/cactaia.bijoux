'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Bell,
    CheckCircle,
    Info,
    X,
    XCircle
} from 'lucide-react';
import { createContext, ReactNode, useContext, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification: Notification = {
            ...notification,
            id,
            duration: notification.duration || 5000
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-remove après la durée spécifiée
        if (newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            removeNotification,
            clearAll
        }}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
}

function NotificationContainer() {
    const { notifications, removeNotification, clearAll } = useNotifications();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 300, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 300, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`
                            relative p-4 rounded-lg shadow-lg border-l-4 min-w-80
                            ${getNotificationStyles(notification.type)}
                        `}
                    >
                        {/* Icône */}
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                            </div>

                            {/* Contenu */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                </p>

                                {/* Action */}
                                {notification.action && (
                                    <button
                                        onClick={notification.action.onClick}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-500 mt-2"
                                    >
                                        {notification.action.label}
                                    </button>
                                )}
                            </div>

                            {/* Bouton fermer */}
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Barre de progression */}
                        {notification.duration && notification.duration > 0 && (
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-current opacity-20"
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: notification.duration / 1000, ease: 'linear' }}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Bouton pour effacer toutes les notifications */}
            {notifications.length > 1 && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={clearAll}
                    className="w-full p-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Effacer toutes les notifications
                </motion.button>
            )}
        </div>
    );
}

function getNotificationStyles(type: NotificationType) {
    switch (type) {
        case 'success':
            return 'bg-green-50 border-green-400 text-green-800';
        case 'error':
            return 'bg-red-50 border-red-400 text-red-800';
        case 'warning':
            return 'bg-yellow-50 border-yellow-400 text-yellow-800';
        case 'info':
            return 'bg-blue-50 border-blue-400 text-blue-800';
        default:
            return 'bg-gray-50 border-gray-400 text-gray-800';
    }
}

function getNotificationIcon(type: NotificationType) {
    const iconClass = 'h-5 w-5';

    switch (type) {
        case 'success':
            return <CheckCircle className={`${iconClass} text-green-400`} />;
        case 'error':
            return <XCircle className={`${iconClass} text-red-400`} />;
        case 'warning':
            return <AlertTriangle className={`${iconClass} text-yellow-400`} />;
        case 'info':
            return <Info className={`${iconClass} text-blue-400`} />;
        default:
            return <Bell className={`${iconClass} text-gray-400`} />;
    }
}

// Hooks utilitaires pour des notifications rapides
export function usePaymentNotifications() {
    const { addNotification } = useNotifications();

    const showSuccess = (title: string, message: string) => {
        addNotification({ type: 'success', title, message });
    };

    const showError = (title: string, message: string) => {
        addNotification({ type: 'error', title, message });
    };

    const showWarning = (title: string, message: string) => {
        addNotification({ type: 'warning', title, message });
    };

    const showInfo = (title: string, message: string) => {
        addNotification({ type: 'info', title, message });
    };

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
}
