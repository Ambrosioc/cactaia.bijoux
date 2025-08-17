'use client';

import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    CreditCard,
    DollarSign,
    Eye,
    Globe,
    MapPin,
    ShoppingCart,
    Target,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaymentAnalytics {
    period: string;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    paymentMethods: Record<string, number>;
    dailyTrends: Array<{
        date: string;
        orders: number;
        revenue: number;
        averageOrderValue: number;
    }>;
    statusDistribution: Record<string, number>;
    topProducts: Array<{
        name: string;
        sales: number;
        revenue: number;
    }>;
    conversionRate: number;
    lastUpdated: string;
}

interface GeographyAnalytics {
    period: string;
    topCities: Array<{
        city: string;
        orders: number;
        revenue: number;
        customers: number;
        averageOrderValue: number;
    }>;
    topRegions: Array<{
        region: string;
        orders: number;
        revenue: number;
        cities: number;
        averageOrderValue: number;
    }>;
    countryDistribution: Array<{
        country: string;
        orders: number;
        revenue: number;
        cities: number;
        percentage: number;
    }>;
    cityRevenue: Array<{
        city: string;
        revenue: number;
        orders: number;
    }>;
    lastUpdated: string;
}

interface PerformanceAnalytics {
    period: string;
    kpis: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
        successRate: number;
        revenueChange: number;
        ordersChange: number;
        successRateChange: number;
    };
    trends: Array<{
        date: string;
        orders: number;
        revenue: number;
        successRate: number;
    }>;
    comparisons: {
        previousPeriod: {
            revenue: number;
            orders: number;
            successRate: number;
        };
        changes: {
            revenue: number;
            orders: number;
            successRate: number;
        };
    };
    insights: Array<{
        type: 'positive' | 'negative' | 'warning';
        title: string;
        description: string;
        icon: string;
    }>;
    lastUpdated: string;
}

export default function AnalyticsDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'geography' | 'performance'>('overview');
    const [period, setPeriod] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [paymentData, setPaymentData] = useState<PaymentAnalytics | null>(null);
    const [geographyData, setGeographyData] = useState<GeographyAnalytics | null>(null);
    const [performanceData, setPerformanceData] = useState<PerformanceAnalytics | null>(null);

    useEffect(() => {
        fetchAllData();
    }, [period]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Récupérer toutes les données en parallèle
            const [paymentsRes, geographyRes, performanceRes] = await Promise.all([
                fetch(`/api/admin/analytics/payments?period=${period}`),
                fetch(`/api/admin/analytics/geography?period=${period}`),
                fetch(`/api/admin/analytics/performance?period=${period}`)
            ]);

            if (!paymentsRes.ok || !geographyRes.ok || !performanceRes.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }

            const [paymentsData, geographyData, performanceData] = await Promise.all([
                paymentsRes.json(),
                geographyRes.json(),
                performanceRes.json()
            ]);

            if (paymentsData.success) setPaymentData(paymentsData.data);
            if (geographyData.success) setGeographyData(geographyData.data);
            if (performanceData.success) setPerformanceData(performanceData.data);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    const formatPercentage = (num: number) => {
        return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
    };

    const getPeriodLabel = (period: string) => {
        const labels = {
            '7d': '7 derniers jours',
            '30d': '30 derniers jours',
            '90d': '90 derniers jours',
            '1y': '1 an'
        };
        return labels[period as keyof typeof labels] || period;
    };

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'positive': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'negative': return <TrendingDown className="h-5 w-5 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            default: return <Target className="h-5 w-5 text-blue-500" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 animate-pulse rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchAllData}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Analytics Avancé</h1>
                    <p className="text-gray-600 mt-2">
                        Données pour {getPeriodLabel(period)} •
                        Dernière mise à jour: {new Date().toISOString().slice(0, 16).replace('T', ' ')}
                    </p>
                </div>

                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="7d">7 jours</option>
                    <option value="30d">30 jours</option>
                    <option value="90d">90 jours</option>
                    <option value="1y">1 an</option>
                </select>
            </div>

            {/* Onglets */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
                        { id: 'payments', label: 'Paiements', icon: CreditCard },
                        { id: 'geography', label: 'Géographie', icon: MapPin },
                        { id: 'performance', label: 'Performance', icon: TrendingUp }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-2 px-1 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* KPIs principaux */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {paymentData ? formatCurrency(paymentData.totalRevenue) : '0 €'}
                                    </p>
                                    {performanceData && (
                                        <p className={`text-sm ${performanceData.kpis.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatPercentage(performanceData.kpis.revenueChange)}
                                        </p>
                                    )}
                                </div>
                                <DollarSign className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Commandes</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {paymentData ? formatNumber(paymentData.totalOrders) : '0'}
                                    </p>
                                    {performanceData && (
                                        <p className={`text-sm ${performanceData.kpis.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatPercentage(performanceData.kpis.ordersChange)}
                                        </p>
                                    )}
                                </div>
                                <ShoppingCart className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Panier moyen</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {paymentData ? formatCurrency(paymentData.averageOrderValue) : '0 €'}
                                    </p>
                                </div>
                                <BarChart3 className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Taux de succès</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {performanceData ? `${performanceData.kpis.successRate.toFixed(1)}%` : '0%'}
                                    </p>
                                    {performanceData && (
                                        <p className={`text-sm ${performanceData.kpis.successRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatPercentage(performanceData.kpis.successRateChange)}
                                        </p>
                                    )}
                                </div>
                                <Target className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    {performanceData && performanceData.insights.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold mb-4">Insights et recommandations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {performanceData.insights.map((insight, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                                        <div className="text-2xl">{insight.icon}</div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                            <p className="text-sm text-gray-600">{insight.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top villes */}
                    {geographyData && geographyData.topCities.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Top 5 des villes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {geographyData.topCities.slice(0, 5).map((city, index) => (
                                    <div key={city.city} className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{index + 1}</div>
                                        <div className="font-medium text-gray-900">{city.city}</div>
                                        <div className="text-sm text-gray-600">{formatCurrency(city.revenue)}</div>
                                        <div className="text-xs text-gray-500">{city.orders} commandes</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'payments' && paymentData && (
                <div className="space-y-6">
                    {/* Méthodes de paiement */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">Méthodes de paiement</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(paymentData.paymentMethods).map(([method, count]) => (
                                <div key={method} className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                                    <div className="text-sm text-gray-600">{method}</div>
                                    <div className="text-xs text-gray-500">
                                        {((count / paymentData.totalOrders) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Distribution des statuts */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">Statuts des commandes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(paymentData.statusDistribution).map(([status, count]) => (
                                <div key={status} className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{count}</div>
                                    <div className="text-sm text-gray-600 capitalize">{status}</div>
                                    <div className="text-xs text-gray-500">
                                        {((count / paymentData.totalOrders) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top produits */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">Top produits</h3>
                        <div className="space-y-3">
                            {paymentData.topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium">{product.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatCurrency(product.revenue)}</div>
                                        <div className="text-sm text-gray-500">{product.sales} ventes</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'geography' && geographyData && (
                <div className="space-y-6">
                    {/* Top villes */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Top 10 des villes
                        </h3>
                        <div className="space-y-3">
                            {geographyData.topCities.map((city, index) => (
                                <div key={city.city} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{city.city}</div>
                                            <div className="text-sm text-gray-500">{city.customers} clients</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatCurrency(city.revenue)}</div>
                                        <div className="text-sm text-gray-500">{city.orders} commandes</div>
                                        <div className="text-xs text-gray-400">{formatCurrency(city.averageOrderValue)}/commande</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top régions */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Top régions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {geographyData.topRegions.map((region, index) => (
                                <div key={region.region} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium">{region.region}</div>
                                        <div className="text-sm text-gray-500">#{index + 1}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(region.revenue)}</div>
                                        <div className="text-sm text-gray-600">{region.orders} commandes</div>
                                        <div className="text-xs text-gray-500">{region.cities} villes</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Distribution par pays */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">Répartition par pays</h3>
                        <div className="space-y-3">
                            {geographyData.countryDistribution.map((country) => (
                                <div key={country.country} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full"></div>
                                        <span className="font-medium">{country.country}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatCurrency(country.revenue)}</div>
                                        <div className="text-sm text-gray-500">{country.orders} commandes</div>
                                        <div className="text-xs text-gray-400">{country.percentage.toFixed(1)}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'performance' && performanceData && (
                <div className="space-y-6">
                    {/* KPIs détaillés */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Taux de conversion</h4>
                            <div className="text-2xl font-bold text-green-600">{performanceData.kpis.successRate.toFixed(1)}%</div>
                            <div className={`text-sm ${performanceData.kpis.successRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(performanceData.kpis.successRateChange)}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Période précédente</h4>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(performanceData.comparisons.previousPeriod.revenue)}</div>
                            <div className="text-sm text-gray-500">{performanceData.comparisons.previousPeriod.orders} commandes</div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Croissance</h4>
                            <div className={`text-2xl font-bold ${performanceData.kpis.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(performanceData.kpis.revenueChange)}
                            </div>
                            <div className="text-sm text-gray-500">vs période précédente</div>
                        </div>
                    </div>

                    {/* Tendances quotidiennes */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">Tendances quotidiennes</h3>
                        <div className="grid grid-cols-7 gap-2">
                            {performanceData.trends.slice(-7).map((day) => (
                                <div key={day.date} className="text-center p-2 border rounded">
                                    <p className="text-xs font-medium">
                                        {new Date(day.date).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </p>
                                    <div className="space-y-1 mt-2">
                                        <div className="text-xs">
                                            <span className="text-blue-600">📦 {day.orders}</span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-green-600">💰 {formatCurrency(day.revenue)}</span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-purple-600">✅ {day.successRate.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insights détaillés */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">Analyse et recommandations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {performanceData.insights.map((insight, index) => (
                                <div key={index} className={`p-4 border rounded-lg ${insight.type === 'positive' ? 'border-green-200 bg-green-50' :
                                    insight.type === 'negative' ? 'border-red-200 bg-red-50' :
                                        'border-yellow-200 bg-yellow-50'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        {getInsightIcon(insight.type)}
                                        <div>
                                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                            <p className="text-sm text-gray-600">{insight.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 