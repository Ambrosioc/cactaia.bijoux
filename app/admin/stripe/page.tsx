'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    CheckCircle,
    DollarSign,
    ExternalLink,
    ShoppingCart,
    TrendingUp,
    Users,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PromotionCode {
    id: string;
    code: string;
    name: string;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    max_uses: number | null;
    used_count: number;
    active: boolean;
    valid_from: string;
    valid_until: string | null;
    created_at: string;
}

interface StripeStats {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    successful_payments: number;
    failed_payments: number;
    conversion_rate: number;
}

export default function StripeAdminPage() {
    const [promotionCodes, setPromotionCodes] = useState<PromotionCode[]>([]);
    const [stats, setStats] = useState<StripeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newCode, setNewCode] = useState({
        code: '',
        name: '',
        discount_type: 'percentage' as 'percentage' | 'fixed_amount',
        discount_amount: '',
        max_redemptions: '',
        expires_at: ''
    });

    useEffect(() => {
        fetchStripeData();
    }, []);

    const fetchStripeData = async () => {
        try {
            setLoading(true);

            // Récupérer les codes promotionnels
            const codesResponse = await fetch('/api/stripe/promotion-codes');
            if (codesResponse.ok) {
                const codesData = await codesResponse.json();
                // L'API retourne { success: true, promotionCodes: [...], total: X }
                if (codesData.success && Array.isArray(codesData.promotionCodes)) {
                    setPromotionCodes(codesData.promotionCodes);
                } else {
                    console.warn('Structure de données inattendue:', codesData);
                    setPromotionCodes([]);
                }
            }

            // Récupérer les statistiques (à implémenter)
            // const statsResponse = await fetch('/api/admin/analytics/stripe-stats');
            // if (statsResponse.ok) {
            //   const statsData = await statsResponse.json();
            //   setStats(statsData);
            // }

            setLoading(false);
        } catch (err) {
            setError('Erreur lors du chargement des données Stripe');
            setLoading(false);
        }
    };

    const handleCreatePromotionCode = async () => {
        try {
            const response = await fetch('/api/stripe/promotion-codes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: newCode.code,
                    name: newCode.name,
                    discount_type: newCode.discount_type,
                    discount_amount: parseFloat(newCode.discount_amount),
                    max_uses: newCode.max_redemptions ? parseInt(newCode.max_redemptions) : null,
                    valid_until: newCode.expires_at || null,
                }),
            });

            if (response.ok) {
                setNewCode({
                    code: '',
                    name: '',
                    discount_type: 'percentage',
                    discount_amount: '',
                    max_redemptions: '',
                    expires_at: ''
                });
                fetchStripeData(); // Recharger les données
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erreur lors de la création du code');
            }
        } catch (err) {
            setError('Erreur lors de la création du code promotionnel');
        }
    };

    const handleDeletePromotionCode = async (codeId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promotionnel ?')) return;

        try {
            const response = await fetch(`/api/stripe/promotion-codes/${codeId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchStripeData(); // Recharger les données
            } else {
                setError('Erreur lors de la suppression du code');
            }
        } catch (err) {
            setError('Erreur lors de la suppression du code promotionnel');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount / 100); // Stripe utilise les centimes
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Pas d\'expiration';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement des données Stripe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Administration Stripe</h1>
                    <p className="text-muted-foreground">
                        Gérez vos paramètres de paiement, codes promotionnels et surveillez vos transactions
                    </p>
                </div>
                <Button onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Dashboard Stripe
                </Button>
            </div>

            {/* Statistiques */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats ? formatCurrency(stats.total_revenue) : '€0,00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% par rapport au mois dernier
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats ? stats.total_orders : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +12% par rapport au mois dernier
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats ? formatCurrency(stats.average_order_value) : '€0,00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +8.2% par rapport au mois dernier
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats ? `${stats.conversion_rate}%` : '0%'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +2.1% par rapport au mois dernier
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Onglets principaux */}
            <Tabs defaultValue="promotion-codes" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="promotion-codes">Codes promotionnels</TabsTrigger>
                    <TabsTrigger value="settings">Paramètres</TabsTrigger>
                    <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                </TabsList>

                {/* Codes promotionnels */}
                <TabsContent value="promotion-codes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Créer un nouveau code promotionnel</CardTitle>
                            <CardDescription>
                                Créez des codes de réduction pour vos clients
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input
                                        id="code"
                                        placeholder="PROMO20"
                                        value={newCode.code}
                                        onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        placeholder="Réduction de 20%"
                                        value={newCode.name}
                                        onChange={(e) => setNewCode({ ...newCode, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discount_type">Type de réduction</Label>
                                    <select
                                        id="discount_type"
                                        className="w-full px-3 py-2 border border-input rounded-md"
                                        value={newCode.discount_type}
                                        onChange={(e) => setNewCode({ ...newCode, discount_type: e.target.value as 'percentage' | 'fixed_amount' })}
                                    >
                                        <option value="percentage">Pourcentage</option>
                                        <option value="fixed_amount">Montant fixe</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discount_amount">
                                        {newCode.discount_type === 'percentage' ? 'Pourcentage (%)' : 'Montant (€)'}
                                    </Label>
                                    <Input
                                        id="discount_amount"
                                        type="number"
                                        placeholder={newCode.discount_type === 'percentage' ? '20' : '10.00'}
                                        value={newCode.discount_amount}
                                        onChange={(e) => setNewCode({ ...newCode, discount_amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_redemptions">Utilisations max (optionnel)</Label>
                                    <Input
                                        id="max_redemptions"
                                        type="number"
                                        placeholder="100"
                                        value={newCode.max_redemptions}
                                        onChange={(e) => setNewCode({ ...newCode, max_redemptions: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expires_at">Date d'expiration (optionnel)</Label>
                                    <Input
                                        id="expires_at"
                                        type="date"
                                        value={newCode.expires_at}
                                        onChange={(e) => setNewCode({ ...newCode, expires_at: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleCreatePromotionCode} className="w-full md:w-auto">
                                Créer le code promotionnel
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Liste des codes existants */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Codes promotionnels existants</CardTitle>
                            <CardDescription>
                                Gérez vos codes de réduction actifs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!Array.isArray(promotionCodes) || promotionCodes.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    Aucun code promotionnel créé pour le moment
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {promotionCodes.map((code) => (
                                        <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge variant={code.active ? 'default' : 'secondary'}>
                                                        {code.active ? 'Actif' : 'Inactif'}
                                                    </Badge>
                                                    <span className="font-mono font-medium">{code.code}</span>
                                                    <span className="text-sm text-muted-foreground">{code.name}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Réduction : {code.discount_type === 'percentage' ? `${code.discount_value}%` : formatCurrency(code.discount_value)}
                                                    {code.max_uses && ` • Max: ${code.used_count}/${code.max_uses}`}
                                                    {code.valid_until && ` • Expire le: ${formatDate(code.valid_until)}`}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeletePromotionCode(code.id)}
                                                >
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Paramètres */}
                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration Stripe</CardTitle>
                            <CardDescription>
                                Gérez vos paramètres de paiement et votre configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Clé publique</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'Non configurée'}
                                            readOnly
                                        />
                                        <Button variant="outline" size="sm">
                                            Copier
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mode</Label>
                                    <Badge variant="outline">
                                        {process.env.NODE_ENV === 'production' ? 'Production' : 'Test'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="pt-4">
                                <h4 className="font-medium mb-2">Devises supportées</h4>
                                <div className="flex gap-2">
                                    <Badge variant="default">EUR</Badge>
                                    <Badge variant="outline">USD</Badge>
                                    <Badge variant="outline">GBP</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Webhooks */}
                <TabsContent value="webhooks" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration des webhooks</CardTitle>
                            <CardDescription>
                                Configurez les webhooks Stripe pour synchroniser vos données
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    URL de webhook : <code className="bg-muted px-2 py-1 rounded">
                                        https://www.cactaiabijoux.fr/api/webhooks/stripe
                                    </code>
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label>Événements configurés</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span>payment_intent.succeeded</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span>payment_intent.payment_failed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span>checkout.session.completed</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Messages d'erreur */}
            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
