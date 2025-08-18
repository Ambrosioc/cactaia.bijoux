'use client';

import { createClient } from '@/lib/supabase/client';
import type { Product, ProductInsert, ProductUpdate } from '@/lib/supabase/types';
import { generateSlug } from '@/lib/utils';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Euro, Loader2, Package, Save, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UploadImagesProduit from './upload-images-produit';

interface ProductFormProps {
    product?: Product;
    isEditing?: boolean;
}

interface FormData {
    nom: string;
    description: string;
    description_courte: string;
    prix: string;
    prix_promo: string;
    categorie: string;
    collections: string[];
    stock: string;
    sku: string;
    poids_grammes: string;
    est_actif: boolean;
    est_mis_en_avant: boolean;
    tva_applicable: boolean;
    images: string[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
}

interface Collection {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
}

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
    const { isActiveAdmin } = useUser();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [collections, setCollections] = useState<Collection[]>([]);
    const [collectionsLoading, setCollectionsLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    const [formData, setFormData] = useState<FormData>({
        nom: product?.nom || '',
        description: product?.description || '',
        description_courte: product?.description_courte || '',
        prix: product?.prix?.toString() || '',
        prix_promo: product?.prix_promo?.toString() || '',
        categorie: product?.categorie || '',
        collections: product?.collections || [],
        stock: product?.stock?.toString() || '0',
        sku: product?.sku || '',
        poids_grammes: product?.poids_grammes?.toString() || '',
        est_actif: product?.est_actif ?? true,
        est_mis_en_avant: product?.est_mis_en_avant ?? false,
        tva_applicable: product?.tva_applicable ?? true,
        images: product?.images || [],
    });

    useEffect(() => {
        if (!isActiveAdmin) {
            router.push('/compte');
        }
    }, [isActiveAdmin, router]);

    // Charger les collections depuis l'API
    useEffect(() => {
        loadCollections();
    }, []);

    // Charger les catégories depuis l'API
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCollections = async () => {
        try {
            setCollectionsLoading(true);
            const response = await fetch('/api/admin/collections');

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Filtrer seulement les collections actives
                    const activeCollections = data.collections.filter((col: Collection) => col.is_active);
                    setCollections(activeCollections);
                } else {
                    console.error('Erreur lors du chargement des collections:', data.error);
                }
            } else {
                console.error('Erreur API collections:', response.status);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des collections:', error);
        } finally {
            setCollectionsLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await fetch('/api/admin/categories');

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Filtrer seulement les catégories actives
                    const activeCategories = data.categories.filter((cat: Category) => cat.is_active);
                    setCategories(activeCategories);

                    // Si c'est un nouveau produit et qu'il n'y a pas de catégorie sélectionnée, sélectionner la première
                    if (!product && activeCategories.length > 0 && !formData.categorie) {
                        setFormData(prev => ({ ...prev, categorie: activeCategories[0].name }));
                    }
                } else {
                    console.error('Erreur lors du chargement des catégories:', data.error);
                }
            } else {
                console.error('Erreur API categories:', response.status);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Effacer l'erreur du champ modifié
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nom.trim()) {
            newErrors.nom = 'Le nom du produit est obligatoire';
        }

        if (!formData.prix || parseFloat(formData.prix) <= 0) {
            newErrors.prix = 'Le prix doit être supérieur à 0';
        }

        if (formData.prix_promo && parseFloat(formData.prix_promo) >= parseFloat(formData.prix)) {
            newErrors.prix_promo = 'Le prix promo doit être inférieur au prix normal';
        }

        if (!formData.categorie) {
            newErrors.categorie = 'La catégorie est obligatoire';
        }

        if (formData.stock && parseInt(formData.stock) < 0) {
            newErrors.stock = 'Le stock ne peut pas être négatif';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSaving(true);
        setMessage(null);

        try {
            const productData = {
                nom: formData.nom.trim(),
                description: formData.description.trim() || null,
                description_courte: formData.description_courte.trim() || null,
                prix: parseFloat(formData.prix),
                prix_promo: formData.prix_promo ? parseFloat(formData.prix_promo) : null,
                categorie: formData.categorie || 'Bijoux',
                collections: formData.collections,
                stock: parseInt(formData.stock) || 0,
                sku: formData.sku.trim() || null,
                poids_grammes: formData.poids_grammes ? parseFloat(formData.poids_grammes) : null,
                est_actif: formData.est_actif,
                est_mis_en_avant: formData.est_mis_en_avant,
                tva_applicable: formData.tva_applicable,
                images: formData.images,
            } satisfies ProductInsert | ProductUpdate;

            if (isEditing && product) {
                // Mise à jour
                const { error } = await supabase
                    .from('produits')
                    .update(productData)
                    .eq('id', product.id);

                if (error) throw error;

                setMessage({
                    type: 'success',
                    text: 'Produit mis à jour avec succès'
                });
            } else {
                // Création
                const slug = generateSlug(formData.nom);
                const productDataWithSlug = { ...productData, slug };
                const { data, error } = await supabase
                    .from('produits')
                    .insert(productDataWithSlug)
                    .select()
                    .single();

                if (error) throw error;

                setMessage({
                    type: 'success',
                    text: 'Produit créé avec succès'
                });

                // Rediriger vers l'édition du nouveau produit
                router.push(`/admin/produits/edit/${data.id}`);
            }

            // Effacer le message après 5 secondes
            setTimeout(() => setMessage(null), 5000);

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la sauvegarde du produit'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

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

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/admin/produits"
                        className="btn btn-outline flex items-center gap-2 px-4 py-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux produits
                    </Link>
                    <div>
                        <h1 className="text-3xl font-medium">
                            {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing ? 'Modifiez les informations du produit' : 'Créez un nouveau produit'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Message de feedback */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg mb-6 ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations générales */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Package className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-medium">Informations générales</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Nom du produit *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => handleInputChange('nom', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.nom ? 'border-red-300' : 'border-input'
                                            }`}
                                        placeholder="Ex: Bracelet Cactus"
                                    />
                                    {errors.nom && (
                                        <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Description courte
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description_courte}
                                        onChange={(e) => handleInputChange('description_courte', e.target.value)}
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Description courte pour les listes de produits"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Description complète
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        placeholder="Description détaillée du produit"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Catégorie *
                                        </label>
                                        <select
                                            value={formData.categorie}
                                            onChange={(e) => handleInputChange('categorie', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.categorie ? 'border-red-300' : 'border-input'
                                                }`}
                                        >
                                            {categoriesLoading ? (
                                                <option value="">Chargement des catégories...</option>
                                            ) : categories.length === 0 ? (
                                                <option value="">Aucune catégorie disponible</option>
                                            ) : (
                                                categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))
                                            )}
                                        </select>
                                        {errors.categorie && (
                                            <p className="text-red-500 text-xs mt-1">{errors.categorie}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            SKU (Référence)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.sku}
                                            onChange={(e) => handleInputChange('sku', e.target.value)}
                                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Généré automatiquement si vide"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Collections
                                    </label>
                                    <div className="space-y-2">
                                        {collectionsLoading ? (
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Chargement des collections...</span>
                                            </div>
                                        ) : collections.length === 0 ? (
                                            <div className="text-sm text-gray-500">
                                                Aucune collection disponible
                                            </div>
                                        ) : (
                                            collections.map(collection => (
                                                <label key={collection.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.collections.includes(collection.name)}
                                                        onChange={(e) => {
                                                            const newCollections = e.target.checked
                                                                ? [...formData.collections, collection.name]
                                                                : formData.collections.filter(c => c !== collection.name);
                                                            handleInputChange('collections', newCollections);
                                                        }}
                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm">{collection.name}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Sélectionnez les collections auxquelles ce produit appartient
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Prix et stock */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Euro className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-medium">Prix et stock</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Prix *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.prix}
                                            onChange={(e) => handleInputChange('prix', e.target.value)}
                                            className={`w-full pl-3 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.prix ? 'border-red-300' : 'border-input'
                                                }`}
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                                    </div>
                                    {errors.prix && (
                                        <p className="text-red-500 text-xs mt-1">{errors.prix}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Prix promo
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.prix_promo}
                                            onChange={(e) => handleInputChange('prix_promo', e.target.value)}
                                            className={`w-full pl-3 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.prix_promo ? 'border-red-300' : 'border-input'
                                                }`}
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                                    </div>
                                    {errors.prix_promo && (
                                        <p className="text-red-500 text-xs mt-1">{errors.prix_promo}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => handleInputChange('stock', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.stock ? 'border-red-300' : 'border-input'
                                            }`}
                                        placeholder="0"
                                    />
                                    {errors.stock && (
                                        <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-2">
                                    Poids (grammes)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={formData.poids_grammes}
                                    onChange={(e) => handleInputChange('poids_grammes', e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Pour le calcul des frais de livraison"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <UploadImagesProduit
                                productId={product?.id}
                                images={formData.images}
                                onImagesChange={(images) => handleInputChange('images', images)}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Statut */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Tag className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-medium">Statut</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Produit actif</label>
                                    <input
                                        type="checkbox"
                                        checked={formData.est_actif}
                                        onChange={(e) => handleInputChange('est_actif', e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Mis en avant</label>
                                    <input
                                        type="checkbox"
                                        checked={formData.est_mis_en_avant}
                                        onChange={(e) => handleInputChange('est_mis_en_avant', e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">TVA applicable</label>
                                    <input
                                        type="checkbox"
                                        checked={formData.tva_applicable}
                                        onChange={(e) => handleInputChange('tva_applicable', e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sauvegarde...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {isEditing ? 'Mettre à jour' : 'Créer le produit'}
                                    </>
                                )}
                            </button>

                            {isEditing && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <p className="text-xs text-muted-foreground">
                                        Dernière modification : {product && product.updated_at ? new Date(product.updated_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}