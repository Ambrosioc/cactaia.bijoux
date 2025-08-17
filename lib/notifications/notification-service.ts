import { createServerClient } from '@/lib/supabase/server';

export interface NotificationData {
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    metadata?: {
        order_id?: string;
        payment_id?: string;
        amount?: number;
        customer_email?: string;
        [key: string]: any;
    };
    action_url?: string;
}

export class NotificationService {
    private static async createNotification(data: NotificationData) {
        try {
            const supabase = await createServerClient();
            
            const { error } = await supabase
                .from('notifications')
                .insert({
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    metadata: data.metadata || {},
                    action_url: data.action_url || null,
                    read: false
                });

            if (error) {
                console.error('❌ Erreur lors de la création de la notification:', error);
                return false;
            }

            console.log('✅ Notification créée:', data.title);
            return true;
        } catch (error) {
            console.error('❌ Erreur NotificationService:', error);
            return false;
        }
    }

    // Notifications de paiements
    static async notifyPaymentSuccess(orderId: string, amount: number, customerEmail: string) {
        return this.createNotification({
            type: 'success',
            title: 'Nouveau paiement réussi',
            message: `Un nouveau paiement de ${new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount / 100)} a été reçu.`,
            metadata: {
                order_id: orderId,
                amount: amount,
                customer_email: customerEmail
            },
            action_url: `/admin/paiements`
        });
    }

    static async notifyPaymentFailed(orderId: string, amount: number, customerEmail: string, reason: string) {
        return this.createNotification({
            type: 'error',
            title: 'Paiement échoué',
            message: `Le paiement de ${new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount / 100)} a échoué: ${reason}`,
            metadata: {
                order_id: orderId,
                amount: amount,
                customer_email: customerEmail
            },
            action_url: `/admin/paiements`
        });
    }

    static async notifyPaymentPending(orderId: string, amount: number, customerEmail: string) {
        return this.createNotification({
            type: 'warning',
            title: 'Paiement en attente',
            message: `Un paiement de ${new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount / 100)} est en attente de confirmation.`,
            metadata: {
                order_id: orderId,
                amount: amount,
                customer_email: customerEmail
            },
            action_url: `/admin/paiements`
        });
    }

    // Notifications de remboursements
    static async notifyRefundCreated(refundId: string, orderId: string, amount: number, reason: string) {
        return this.createNotification({
            type: 'info',
            title: 'Remboursement créé',
            message: `Un remboursement de ${new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount / 100)} a été créé pour la raison: ${reason}`,
            metadata: {
                order_id: orderId,
                amount: amount,
                refund_id: refundId
            },
            action_url: `/admin/paiements`
        });
    }

    static async notifyRefundProcessed(refundId: string, orderId: string, amount: number, status: string) {
        const type = status === 'succeeded' ? 'success' : status === 'failed' ? 'error' : 'warning';
        const statusText = status === 'succeeded' ? 'traité avec succès' : 
                          status === 'failed' ? 'échoué' : 'en cours de traitement';

        return this.createNotification({
            type,
            title: `Remboursement ${statusText}`,
            message: `Le remboursement de ${new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount / 100)} est ${statusText}.`,
            metadata: {
                order_id: orderId,
                amount: amount,
                refund_id: refundId,
                status: status
            },
            action_url: `/admin/paiements`
        });
    }

    // Notifications de commandes
    static async notifyNewOrder(orderId: string, amount: number, customerEmail: string) {
        return this.createNotification({
            type: 'info',
            title: 'Nouvelle commande',
            message: `Une nouvelle commande de ${new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount / 100)} a été passée.`,
            metadata: {
                order_id: orderId,
                amount: amount,
                customer_email: customerEmail
            },
            action_url: `/admin/commandes`
        });
    }

    static async notifyOrderStatusChange(orderId: string, oldStatus: string, newStatus: string) {
        return this.createNotification({
            type: 'info',
            title: 'Changement de statut de commande',
            message: `Le statut de la commande ${orderId} est passé de "${oldStatus}" à "${newStatus}".`,
            metadata: {
                order_id: orderId,
                old_status: oldStatus,
                new_status: newStatus
            },
            action_url: `/admin/commandes`
        });
    }

    // Notifications système
    static async notifySystemWarning(title: string, message: string, metadata?: any) {
        return this.createNotification({
            type: 'warning',
            title,
            message,
            metadata
        });
    }

    static async notifySystemError(title: string, message: string, metadata?: any) {
        return this.createNotification({
            type: 'error',
            title,
            message,
            metadata
        });
    }

    static async notifySystemInfo(title: string, message: string, metadata?: any) {
        return this.createNotification({
            type: 'info',
            title,
            message,
            metadata
        });
    }

    // Notifications de stock
    static async notifyLowStock(productId: string, productName: string, currentStock: number, threshold: number = 5) {
        return this.createNotification({
            type: 'warning',
            title: 'Stock faible',
            message: `Le produit "${productName}" a un stock faible (${currentStock} restant${currentStock > 1 ? 's' : ''}).`,
            metadata: {
                product_id: productId,
                product_name: productName,
                current_stock: currentStock,
                threshold: threshold
            },
            action_url: `/admin/stocks`
        });
    }

    static async notifyOutOfStock(productId: string, productName: string) {
        return this.createNotification({
            type: 'error',
            title: 'Produit en rupture de stock',
            message: `Le produit "${productName}" est en rupture de stock.`,
            metadata: {
                product_id: productId,
                product_name: productName
            },
            action_url: `/admin/stocks`
        });
    }
}
