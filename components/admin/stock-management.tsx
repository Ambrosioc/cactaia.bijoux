'use client';

import { stockManager } from '@/lib/inventory/stock-manager';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Eye,
    History,
    Package,
    Plus,
    Settings,
    TrendingDown,
    TrendingUp,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProductStock {
    product_id: string;
    product_name: string;
    current_stock: number;
    reserved_stock: number;
    available_stock: number;
    low_stock_threshold: number;
    last_movement: string;
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

interface StockAlert {
    id: string;
    product_id: string;
    alert_type: 'low_stock' | 'out_of_stock' | 'overstock';
    threshold: number;
    current_stock: number;
    is_active: boolean;
    created_at: string;
    resolved_at?: string;
}

interface StockMovement {
    id: string;
    product_id: string;
    movement_type: 'in' | 'out' | 'adjustment' | 'reserved' | 'released';
    quantity: number;
    previous_stock: number;
    new_stock: number;
    reason: string;
    order_id?: string;
    user_id?: string;
    notes?: string;
    created_at: string;
}

export default function StockManagement() {
    const { isActiveAdmin } = useUser();
    const [products, setProducts] = useState<ProductStock[]>([]);
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [stockHistory, setStockHistory] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddStock, setShowAddStock] = useState(false);
    const [showAdjustStock, setShowAdjustStock] = useState(false);
    const [selectedProductForAction, setSelectedProductForAction] = useState<string | null>(null);
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (isActiveAdmin) {
            loadStockData();
        }
    }, [isActiveAdmin]);

    const loadStockData = async () => {
        try {
            setLoading(true);

            // Charger les produits avec leur stock
            const { data: productsData } = await stockManager.supabase
                .from('product_stock_overview')
                .select('*')
                .order('available_stock', { ascending: true });

            setProducts(productsData || []);

            // Charger les alertes actives
            const alertsData = await stockManager.getActiveStockAlerts();
            setAlerts(alertsData);

        } catch (error) {
            console.error('Erreur lors du chargement des données de stock:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStockHistory = async (productId: string) => {
        try {
            const history = await stockManager.getStockHistory(productId, 20);
            setStockHistory(history);
            setSelectedProduct(productId);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique:', error);
        }
    };

    const handleAddStock = async () => {
        if (!selectedProductForAction || !quantity || !reason) return;

        setActionLoading(true);
        try {
            const success = await stockManager.addStock(
                selectedProductForAction,
                parseInt(quantity),
                reason,
                undefined // userId sera ajouté automatiquement
            );

            if (success) {
                setShowAddStock(false);
                setQuantity('');
                setReason('');
                setSelectedProductForAction(null);
                await loadStockData();
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de stock:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAdjustStock = async () => {
        if (!selectedProductForAction || !quantity || !reason) return;

        setActionLoading(true);
        try {
            const success = await stockManager.adjustStock(
                selectedProductForAction,
                parseInt(quantity),
                reason,
                undefined // userId sera ajouté automatiquement
            );

            if (success) {
                setShowAdjustStock(false);
                setQuantity('');
                setReason('');
                setSelectedProductForAction(null);
                await loadStockData();
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajustement de stock:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'out_of_stock':
                return 'text-red-600 bg-red-50';
            case 'low_stock':
                return 'text-orange-600 bg-orange-50';
            case 'overstock':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-green-600 bg-green-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'out_of_stock':
                return X;
            case 'low_stock':
                return AlertTriangle;
            case 'overstock':
                return TrendingUp;
            default:
                return Package;
        }
    };

    const getAlertIcon = (alertType: string) => {
        switch (alertType) {
            case 'out_of_stock':
                return X;
            case 'low_stock':
                return TrendingDown;
            case 'overstock':
                return TrendingUp;
            default:
                return AlertTriangle;
        }
    };

    const getMovementIcon = (movementType: string) => {
        switch (movementType) {
            case 'in':
                return ArrowUp;
            case 'out':
                return ArrowDown;
            case 'adjustment':
                return Settings;
            case 'reserved':
                return Eye;
            case 'released':
                return Eye;
            default:
                return Package;
        }
    };

    if (!isActiveAdmin) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-medium mb-4">Accès non autorisé</h1>
                    <p className="text-muted-foreground">
                        Vous devez être administrateur pour accéder à cette page.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-medium mb-2">Gestion des Stocks</h1>
                    <p className="text-muted-foreground">
                        Surveillez et gérez les stocks de vos produits
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setShowAddStock(true);
                            setSelectedProductForAction(null);
                        }}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter du stock
                    </button>
                </div>
            </div>

            {/* Alertes de stock */}
            {alerts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-lg shadow-sm border border-orange-200 mb-8"
                >
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Alertes de stock ({alerts.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alerts.map((alert) => {
                            const product = products.find(p => p.product_id === alert.product_id);
                            const AlertIcon = getAlertIcon(alert.alert_type);

                            return (
                                <div key={alert.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertIcon className="h-4 w-4 text-orange-600" />
                                        <span className="text-sm font-medium text-orange-800">
                                            {alert.alert_type === 'out_of_stock' ? 'Stock épuisé' :
                                                alert.alert_type === 'low_stock' ? 'Stock faible' : 'Surstock'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-orange-700 mb-1">
                                        {product?.product_name || 'Produit inconnu'}
                                    </p>
                                    <p className="text-xs text-orange-600">
                                        Stock actuel: {alert.current_stock} | Seuil: {alert.threshold}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Vue d'ensemble des stocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Liste des produits */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium mb-4">Vue d'ensemble des stocks</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Produit
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Disponible
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {products.map((product, i) => {
                                        const StatusIcon = getStatusIcon(product.status);

                                        return (
                                            <motion.tr
                                                key={product.product_id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {product.product_name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-foreground">
                                                        {product.current_stock}
                                                        {product.reserved_stock > 0 && (
                                                            <span className="text-xs text-muted-foreground ml-1">
                                                                (-{product.reserved_stock} réservé)
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`text-sm font-medium ${product.available_stock === 0 ? 'text-red-600' :
                                                            product.available_stock <= product.low_stock_threshold ? 'text-orange-600' :
                                                                'text-green-600'
                                                        }`}>
                                                        {product.available_stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {product.status === 'out_of_stock' ? 'Épuisé' :
                                                            product.status === 'low_stock' ? 'Faible' :
                                                                product.status === 'overstock' ? 'Surstock' : 'En stock'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => loadStockHistory(product.product_id)}
                                                            className="text-primary hover:text-primary/80"
                                                            title="Voir l'historique"
                                                        >
                                                            <History className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowAddStock(true);
                                                                setSelectedProductForAction(product.product_id);
                                                            }}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Ajouter du stock"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowAdjustStock(true);
                                                                setSelectedProductForAction(product.product_id);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Ajuster le stock"
                                                        >
                                                            <Settings className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Historique des mouvements */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium mb-4">Historique des mouvements</h3>
                        {selectedProduct ? (
                            <div className="space-y-3">
                                {stockHistory.map((movement) => {
                                    const MovementIcon = getMovementIcon(movement.movement_type);

                                    return (
                                        <div key={movement.id} className="p-3 border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MovementIcon className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm font-medium">
                                                    {movement.movement_type === 'in' ? 'Entrée' :
                                                        movement.movement_type === 'out' ? 'Sortie' :
                                                            movement.movement_type === 'adjustment' ? 'Ajustement' :
                                                                movement.movement_type === 'reserved' ? 'Réservé' : 'Libéré'}
                                                </span>
                                                <span className={`text-sm font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-1">{movement.reason}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                Sélectionnez un produit pour voir son historique
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Ajouter du stock */}
            {showAddStock && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Ajouter du stock</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quantité</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Quantité à ajouter"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Raison</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Raison de l'ajout"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddStock}
                                    disabled={actionLoading || !quantity || !reason}
                                    className="btn btn-primary flex-1"
                                >
                                    {actionLoading ? 'Ajout...' : 'Ajouter'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddStock(false);
                                        setQuantity('');
                                        setReason('');
                                        setSelectedProductForAction(null);
                                    }}
                                    className="btn btn-outline flex-1"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ajuster le stock */}
            {showAdjustStock && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Ajuster le stock</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nouvelle quantité</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Nouvelle quantité"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Raison</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Raison de l'ajustement"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAdjustStock}
                                    disabled={actionLoading || !quantity || !reason}
                                    className="btn btn-primary flex-1"
                                >
                                    {actionLoading ? 'Ajustement...' : 'Ajuster'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAdjustStock(false);
                                        setQuantity('');
                                        setReason('');
                                        setSelectedProductForAction(null);
                                    }}
                                    className="btn btn-outline flex-1"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 