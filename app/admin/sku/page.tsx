'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Box, Copy, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SKU {
    id: string;
    sku: string;
    product_name: string;
    category: string;
    is_active: boolean;
    created_at: string;
}

export default function SKUPage() {
    const [skus, setSkus] = useState<SKU[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingSku, setEditingSku] = useState<SKU | null>(null);
    const [formData, setFormData] = useState({
        sku: '',
        product_name: '',
        category: ''
    });

    useEffect(() => {
        loadSKUs();
    }, []);

    const loadSKUs = async () => {
        try {
            setLoading(true);
            // TODO: Implémenter l'API pour récupérer les SKU

            // Données temporaires pour la démo
            setSkus([
                {
                    id: '1',
                    sku: 'SKU-BAG001',
                    product_name: 'Bague Élégance',
                    category: 'Bagues',
                    is_active: true,
                    created_at: '2025-01-15'
                },
                {
                    id: '2',
                    sku: 'SKU-COL002',
                    product_name: 'Collier Harmonie',
                    category: 'Colliers',
                    is_active: true,
                    created_at: '2025-01-16'
                },
                {
                    id: '3',
                    sku: 'SKU-BRA003',
                    product_name: 'Bracelet Zen',
                    category: 'Bracelets',
                    is_active: false,
                    created_at: '2025-01-17'
                }
            ]);
        } catch (error) {
            console.error('Erreur lors du chargement des SKU:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSku) {
                // TODO: Implémenter la mise à jour
                console.log('Mise à jour SKU:', editingSku.id, formData);
            } else {
                // TODO: Implémenter la création
                console.log('Création SKU:', formData);
            }

            setShowForm(false);
            setEditingSku(null);
            setFormData({ sku: '', product_name: '', category: '' });
            await loadSKUs();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    const handleEdit = (sku: SKU) => {
        setEditingSku(sku);
        setFormData({
            sku: sku.sku,
            product_name: sku.product_name,
            category: sku.category
        });
        setShowForm(true);
    };

    const handleDelete = async (skuId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce SKU ?')) return;

        try {
            // TODO: Implémenter la suppression
            console.log('Suppression SKU:', skuId);
            await loadSKUs();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // TODO: Ajouter une notification de succès
    };

    const filteredSKUs = skus.filter(sku =>
        sku.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement des SKU...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des SKU</h1>
                    <p className="text-muted-foreground">
                        Gérez les codes SKU de vos produits pour un inventaire organisé
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau SKU
                </Button>
            </div>

            {/* Barre de recherche */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par SKU, nom de produit ou catégorie..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Formulaire d'ajout/modification */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingSku ? 'Modifier le SKU' : 'Nouveau SKU'}
                        </CardTitle>
                        <CardDescription>
                            {editingSku ? 'Modifiez les informations du SKU' : 'Créez un nouveau SKU'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">Code SKU</Label>
                                    <Input
                                        id="sku"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        placeholder="Ex: SKU-BAG001"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product_name">Nom du produit</Label>
                                    <Input
                                        id="product_name"
                                        value={formData.product_name}
                                        onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                        placeholder="Ex: Bague Élégance"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Catégorie</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Ex: Bagues"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingSku ? 'Mettre à jour' : 'Créer'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingSku(null);
                                        setFormData({ sku: '', product_name: '', category: '' });
                                    }}
                                >
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Liste des SKU */}
            <Card>
                <CardHeader>
                    <CardTitle>SKU existants</CardTitle>
                    <CardDescription>
                        {filteredSKUs.length} SKU trouvé{filteredSKUs.length > 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredSKUs.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            {searchTerm ? 'Aucun SKU trouvé pour cette recherche' : 'Aucun SKU créé pour le moment'}
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {filteredSKUs.map((sku) => (
                                <div key={sku.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Box className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-mono font-medium">{sku.sku}</h3>
                                                <Badge variant={sku.is_active ? 'default' : 'secondary'}>
                                                    {sku.is_active ? 'Actif' : 'Inactif'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium">{sku.product_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {sku.category}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Créé le {new Date(sku.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(sku.sku)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(sku)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(sku.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
