'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Palette, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Variation {
    id: string;
    name: string;
    type: 'color' | 'size' | 'material' | 'style';
    values: string[];
    is_active: boolean;
}

export default function VariationsPage() {
    const [variations, setVariations] = useState<Variation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVariation, setEditingVariation] = useState<Variation | null>(null);
    const [formData, setFormData] = useState<{ name: string; type: Variation['type']; values: string; is_active: boolean }>({
        name: '',
        type: 'color',
        values: '',
        is_active: true
    });

    useEffect(() => {
        loadVariations();
    }, []);

    const loadVariations = async () => {
        try {
            setLoading(true);
            // TODO: Implémenter l'API pour récupérer les variations

            // Données temporaires pour la démo
            setVariations([
                {
                    id: '1',
                    name: 'Couleur',
                    type: 'color',
                    values: ['Or', 'Argent', 'Rose Gold', 'Noir'],
                    is_active: true
                },
                {
                    id: '2',
                    name: 'Taille',
                    type: 'size',
                    values: ['XS', 'S', 'M', 'L', 'XL'],
                    is_active: true
                },
                {
                    id: '3',
                    name: 'Matériau',
                    type: 'material',
                    values: ['Acier inoxydable', 'Laiton', 'Cuir', 'Tissu'],
                    is_active: true
                }
            ]);
        } catch (error) {
            console.error('Erreur lors du chargement des variations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const valuesArray = formData.values.split(',').map(v => v.trim()).filter(v => v);

            if (editingVariation) {
                // TODO: Implémenter la mise à jour
                console.log('Mise à jour variation:', editingVariation.id, { ...formData, values: valuesArray });
            } else {
                // TODO: Implémenter la création
                console.log('Création variation:', { ...formData, values: valuesArray });
            }

            setShowForm(false);
            setEditingVariation(null);
            setFormData({ name: '', type: 'color', values: '', is_active: true });
            await loadVariations();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    const handleEdit = (variation: Variation) => {
        setEditingVariation(variation);
        setFormData({
            name: variation.name,
            type: variation.type,
            values: variation.values.join(', '),
            is_active: variation.is_active
        });
        setShowForm(true);
    };

    const handleDelete = async (variationId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette variation ?')) return;

        try {
            // TODO: Implémenter la suppression
            console.log('Suppression variation:', variationId);
            await loadVariations();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            color: 'Couleur',
            size: 'Taille',
            material: 'Matériau',
            style: 'Style'
        };
        return labels[type as keyof typeof labels] || type;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement des variations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Variations</h1>
                    <p className="text-muted-foreground">
                        Créez et gérez les variations de vos produits (couleurs, tailles, matériaux, etc.)
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle variation
                </Button>
            </div>

            {/* Formulaire d'ajout/modification */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingVariation ? 'Modifier la variation' : 'Nouvelle variation'}
                        </CardTitle>
                        <CardDescription>
                            {editingVariation ? 'Modifiez les informations de la variation' : 'Créez une nouvelle variation'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom de la variation</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Couleur, Taille, Matériau"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type de variation</Label>
                                    <select
                                        id="type"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as unknown as Variation['type'] })}
                                        className="w-full px-3 py-2 border border-input rounded-md"
                                        required
                                    >
                                        <option value="color">Couleur</option>
                                        <option value="size">Taille</option>
                                        <option value="material">Matériau</option>
                                        <option value="style">Style</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="values">Valeurs possibles</Label>
                                <Input
                                    id="values"
                                    value={formData.values}
                                    onChange={(e) => setFormData({ ...formData, values: e.target.value })}
                                    placeholder="Ex: Rouge, Bleu, Vert (séparés par des virgules)"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Séparez les valeurs par des virgules
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="is_active">Variation active</Label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingVariation ? 'Mettre à jour' : 'Créer'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingVariation(null);
                                        setFormData({ name: '', type: 'color', values: '', is_active: true });
                                    }}
                                >
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Liste des variations */}
            <Card>
                <CardHeader>
                    <CardTitle>Variations existantes</CardTitle>
                    <CardDescription>
                        Gérez les variations de vos produits
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {variations.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Aucune variation créée pour le moment
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {variations.map((variation) => (
                                <div key={variation.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Palette className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{variation.name}</h3>
                                                <Badge variant="outline">
                                                    {getTypeLabel(variation.type)}
                                                </Badge>
                                                <Badge variant={variation.is_active ? 'default' : 'secondary'}>
                                                    {variation.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {variation.values.map((value, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {value}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(variation)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(variation.id)}
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
