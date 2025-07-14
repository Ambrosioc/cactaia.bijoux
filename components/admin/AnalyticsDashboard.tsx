'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    BarChart3,
    CreditCard,
    DollarSign,
    Eye,
    ShoppingCart,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalyticsData {
    period: string;
    metrics: {
        totalEvents: number;
        pageViews: number;
        productViews: number;
        addToCart: number;
        purchases: number;
        totalRevenue: string;
        conversionRate: number;
        addToCartRate: number;
    };
    topProducts: Array<{ name: string; count: number }>;
    topPages: Array<{ url: string; count: number }>;
    dailyData: Array<{
        date: string;
        pageViews: number;
        productViews: number;
        addToCart: number;
        purchases: number;
    }>;
    lastUpdated: string;
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState('7d');

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/analytics/dashboard?period=${period}`);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentification requise');
                } else if (response.status === 403) {
                    throw new Error('Accès refusé - Rôle admin requis');
                } else {
                    throw new Error('Erreur lors du chargement des données');
                }
            }

            const analyticsData = await response.json();
            setData(analyticsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(parseFloat(amount));
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR').format(num);
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

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={fetchAnalytics} variant="outline">
                            Réessayer
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-gray-500">Aucune donnée disponible</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
                    <p className="text-gray-600">
                        Données pour {getPeriodLabel(period)} •
                        Dernière mise à jour: {new Date(data.lastUpdated).toLocaleString('fr-FR')}
                    </p>
                </div>

                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">7 jours</SelectItem>
                        <SelectItem value="30d">30 jours</SelectItem>
                        <SelectItem value="90d">90 jours</SelectItem>
                        <SelectItem value="1y">1 an</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pages vues</p>
                                <p className="text-2xl font-bold">{formatNumber(data.metrics.pageViews)}</p>
                            </div>
                            <Eye className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Produits vus</p>
                                <p className="text-2xl font-bold">{formatNumber(data.metrics.productViews)}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Ajouts au panier</p>
                                <p className="text-2xl font-bold">{formatNumber(data.metrics.addToCart)}</p>
                                <p className="text-xs text-gray-500">
                                    {data.metrics.addToCartRate.toFixed(1)}% de conversion
                                </p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Achats</p>
                                <p className="text-2xl font-bold">{formatNumber(data.metrics.purchases)}</p>
                                <p className="text-xs text-gray-500">
                                    {data.metrics.conversionRate.toFixed(1)}% de conversion
                                </p>
                            </div>
                            <CreditCard className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chiffre d'affaires */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Chiffre d'affaires</h3>
                            <p className="text-3xl font-bold text-green-600">
                                {formatCurrency(data.metrics.totalRevenue)}
                            </p>
                        </div>
                        <DollarSign className="h-12 w-12 text-green-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Produits et pages populaires */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Produits les plus vus */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Produits les plus vus
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">{index + 1}</Badge>
                                        <span className="font-medium">{product.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">{product.count} vues</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pages les plus visitées */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Pages les plus visitées
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.topPages.map((page, index) => (
                                <div key={page.url} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">{index + 1}</Badge>
                                        <span className="font-medium text-sm">
                                            {page.url === '/' ? 'Accueil' : page.url}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-600">{page.count} vues</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Évolution temporelle */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Évolution des 7 derniers jours
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                        {data.dailyData.map((day) => (
                            <div key={day.date} className="text-center p-2 border rounded">
                                <p className="text-xs font-medium">
                                    {new Date(day.date).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </p>
                                <div className="space-y-1 mt-2">
                                    <div className="text-xs">
                                        <span className="text-blue-600">👁️ {day.pageViews}</span>
                                    </div>
                                    <div className="text-xs">
                                        <span className="text-green-600">📊 {day.productViews}</span>
                                    </div>
                                    <div className="text-xs">
                                        <span className="text-orange-600">🛒 {day.addToCart}</span>
                                    </div>
                                    <div className="text-xs">
                                        <span className="text-purple-600">💳 {day.purchases}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 