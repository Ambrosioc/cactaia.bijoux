'use client';

import { analytics } from '@/lib/analytics';
import { formatPrice } from '@/lib/utils';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    BarChart3,
    DollarSign,
    Eye,
    MousePointer,
    Package,
    ShoppingCart,
    TrendingUp,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface AnalyticsMetrics {
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    conversion_rate: number;
    top_products: Array<{
        product_id: string;
        product_name: string;
        views: number;
        sales: number;
        revenue: number;
    }>;
    daily_sales: Array<{
        date: string;
        orders: number;
        revenue: number;
    }>;
    user_metrics: {
        total_users: number;
        new_users_today: number;
        active_users_today: number;
    };
}

export default function AnalyticsDashboard() {
    const { isActiveAdmin } = useUser();
    const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isActiveAdmin) {
            loadMetrics();
        }
    }, [isActiveAdmin, selectedPeriod]);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await analytics.getDashboardMetrics(selectedPeriod);
            setMetrics(data);
        } catch (error) {
            console.error('Erreur lors du chargement des métriques:', error);
            setError('Erreur lors du chargement des métriques');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            title: 'Commandes',
            value: metrics?.total_orders || 0,
            change: '+12%',
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Chiffre d\'affaires',
            value: formatPrice(metrics?.total_revenue || 0),
            change: '+8%',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Panier moyen',
            value: formatPrice(metrics?.average_order_value || 0),
            change: '+5%',
            icon: Package,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Taux de conversion',
            value: `${(metrics?.conversion_rate || 0).toFixed(2)}%`,
            change: '+2%',
            icon: TrendingUp,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
    ];

    const userStats = [
        {
            title: 'Utilisateurs totaux',
            value: metrics?.user_metrics.total_users || 0,
            icon: Users,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
        },
        {
            title: 'Nouveaux aujourd\'hui',
            value: metrics?.user_metrics.new_users_today || 0,
            icon: Eye,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
        },
        {
            title: 'Utilisateurs actifs',
            value: metrics?.user_metrics.active_users_today || 0,
            icon: MousePointer,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50',
        },
    ];

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

    if (error) {
        return (
            <div className="p-8">
                <div className="text-center py-16">
                    <BarChart3 className="h-16 w-16 mx-auto text-red-500 mb-4" />
                    <h3 className="text-xl font-medium mb-2 text-red-700">Erreur de chargement</h3>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <button
                        onClick={loadMetrics}
                        className="btn btn-primary px-6 py-2"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-medium mb-2">Analytics & Reporting</h1>
                    <p className="text-muted-foreground">
                        Tableau de bord des performances de votre boutique
                    </p>
                </div>

                {/* Sélecteur de période */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Période:</span>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                        className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value={7}>7 jours</option>
                        <option value={30}>30 jours</option>
                        <option value={90}>90 jours</option>
                    </select>
                </div>
            </div>

            {/* Stats principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="bg-white p-6 rounded-lg shadow-sm border"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-green-600">{stat.change}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Ventes quotidiennes */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <h3 className="text-lg font-medium mb-4">Ventes quotidiennes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={metrics?.daily_sales || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                                formatter={(value: any, name: string) => [
                                    name === 'revenue' ? formatPrice(value) : value,
                                    name === 'revenue' ? 'CA' : 'Commandes'
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#B86B4B"
                                strokeWidth={2}
                                name="revenue"
                            />
                            <Line
                                type="monotone"
                                dataKey="orders"
                                stroke="#4A7C59"
                                strokeWidth={2}
                                name="orders"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Produits les plus vus */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <h3 className="text-lg font-medium mb-4">Produits les plus vus</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={metrics?.top_products.slice(0, 8) || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="product_name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="views" fill="#B86B4B" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Métriques utilisateurs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white p-6 rounded-lg shadow-sm border"
            >
                <h3 className="text-lg font-medium mb-4">Métriques utilisateurs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {userStats.map((stat, i) => (
                        <div key={stat.title} className="text-center">
                            <div className={`inline-flex p-3 rounded-full ${stat.bgColor} mb-3`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <p className="text-2xl font-bold mb-1">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Tableau des produits les plus populaires */}
            {metrics?.top_products && metrics.top_products.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="bg-white p-6 rounded-lg shadow-sm border mt-8"
                >
                    <h3 className="text-lg font-medium mb-4">Top 10 des produits les plus vus</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Produit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Vues
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Ventes
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        CA généré
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {metrics.top_products.map((product, i) => (
                                    <tr key={product.product_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-foreground">
                                                {product.product_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-foreground">{product.views}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-foreground">{product.sales}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-foreground">
                                                {formatPrice(product.revenue)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
} 