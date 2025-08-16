'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Folder, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    product_count: number;
    is_active: boolean;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            // TODO: Implémenter l'API pour récupérer les catégories
            // const response = await fetch('/api/admin/categories');
            // if (response.ok) {
            //   const data = await response.json();
            //   setCategories(data);
            // }

            // Données temporaires pour la démo
            setCategories([
                {
                    id: '1',
                    name: 'Bagues',
                    slug: 'bagues',
                    description: 'Bagues élégantes et modernes',
                    product_count: 15,
                    is_active: true
                },
                {
                    id: '2',
                    name: 'Colliers',
                    slug: 'colliers',
                    description: 'Colliers et chaînes',
                    product_count: 12,
                    is_active: true
                }
            ]);
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                // TODO: Implémenter la mise à jour
                console.log('Mise à jour catégorie:', editingCategory.id, formData);
            } else {
                // TODO: Implémenter la création
                console.log('Création catégorie:', formData);
            }

            setShowForm(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '', is_active: true });
            await loadCategories();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            is_active: category.is_active
        });
        setShowForm(true);
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        try {
            // TODO: Implémenter la suppression
            console.log('Suppression catégorie:', categoryId);
            await loadCategories();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement des catégories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Catégories</h1>
                    <p className="text-muted-foreground">
                        Organisez vos produits en catégories pour une meilleure navigation
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle catégorie
                </Button>
            </div>

            {/* Formulaire d'ajout/modification */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                        </CardTitle>
                        <CardDescription>
                            {editingCategory ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom de la catégorie</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Bagues"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Description de la catégorie"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="is_active">Catégorie active</Label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingCategory ? 'Mettre à jour' : 'Créer'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingCategory(null);
                                        setFormData({ name: '', description: '', is_active: true });
                                    }}
                                >
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Liste des catégories */}
            <Card>
                <CardHeader>
                    <CardTitle>Catégories existantes</CardTitle>
                    <CardDescription>
                        Gérez vos catégories de produits
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {categories.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Aucune catégorie créée pour le moment
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Folder className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{category.name}</h3>
                                                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {category.product_count} produit{category.product_count > 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                            {category.description && (
                                                <p className="text-sm text-muted-foreground">{category.description}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">Slug: {category.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(category)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(category.id)}
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
