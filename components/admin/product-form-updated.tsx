'use client';

import { motion } from 'framer-motion';
import {
    Folder,
    Image as ImageIcon,
    Loader2,
    Package,
    Plus,
    Save,
    Tag,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    sort_order: number;
    product_count?: number;
}

interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    banner_url: string | null;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    meta_title: string | null;
    meta_description: string | null;
    product_count?: number;
}

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    stock: number;
    sku: string;
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    is_active: boolean;
    is_featured: boolean;
    category_ids: string[];
    collection_ids: string[];
    images: string[];
    meta_title: string;
    meta_description: string;
    tags: string[];
}

interface ProductFormProps {
    initialData?: Partial<ProductFormData>;
    onSubmit: (data: ProductFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export default function ProductFormUpdated({
    initialData,
    onSubmit,
    onCancel,
    loading = false
}: ProductFormProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        sku: '',
        weight: 0,
        dimensions: {
            length: 0,
            width: 0,
            height: 0
        },
        is_active: true,
        is_featured: false,
        category_ids: [],
        collection_ids: [],
        images: [],
        meta_title: '',
        meta_description: '',
        tags: []
    });

    const [newTag, setNewTag] = useState('');
    const [newImage, setNewImage] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
        loadFormData();
    }, [initialData]);

    const loadFormData = async () => {
        try {
            setLoadingData(true);
            setError(null);

            // Charger les catégories et collections en parallèle
            const [categoriesResponse, collectionsResponse] = await Promise.all([
                fetch('/api/admin/categories'),
                fetch('/api/admin/collections')
            ]);

            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                if (categoriesData.success) {
                    setCategories(categoriesData.categories);
                }
            }

            if (collectionsResponse.ok) {
                const collectionsData = await collectionsResponse.json();
                if (collectionsData.success) {
                    setCollections(collectionsData.collections);
                }
            }

        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            setError('Erreur lors du chargement des données');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            setError('Erreur lors de la sauvegarde');
        }
    };

    const handleInputChange = (field: keyof ProductFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDimensionChange = (dimension: keyof typeof formData.dimensions, value: number) => {
        setFormData(prev => ({
            ...prev,
            dimensions: {
                ...prev.dimensions,
                [dimension]: value
            }
        }));
    };

    const handleCategoryToggle = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            category_ids: prev.category_ids.includes(categoryId)
                ? prev.category_ids.filter(id => id !== categoryId)
                : [...prev.category_ids, categoryId]
        }));
    };

    const handleCollectionToggle = (collectionId: string) => {
        setFormData(prev => ({
            ...prev,
            collection_ids: prev.collection_ids.includes(collectionId)
                ? prev.collection_ids.filter(id => id !== collectionId)
                : [...prev.collection_ids, collectionId]
        }));
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const addImage = () => {
        if (newImage.trim() && !formData.images.includes(newImage.trim())) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, newImage.trim()]
            }));
            setNewImage('');
        }
    };

    const removeImage = (imageToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(image => image !== imageToRemove)
        }));
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Chargement des données...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={loadFormData}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-8"
        >
            {/* Informations de base */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Informations de base
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom du produit *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SKU *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.sku}
                            onChange={(e) => handleInputChange('sku', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Prix et stock */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Prix et stock
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prix (€) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.stock}
                            onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Poids (g)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.weight}
                            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Dimensions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Dimensions (cm)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Longueur
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.dimensions.length}
                            onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Largeur
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.dimensions.width}
                            onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hauteur
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.dimensions.height}
                            onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Catégories et Collections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Folder className="h-5 w-5 mr-2" />
                    Catégories et Collections
                </h3>

                {/* Catégories */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Catégories
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categories.map((category) => (
                            <label key={category.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.category_ids.includes(category.id)}
                                    onChange={() => handleCategoryToggle(category.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    {category.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Collections */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Collections
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {collections.map((collection) => (
                            <label key={collection.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.collection_ids.includes(collection.id)}
                                    onChange={() => handleCollectionToggle(collection.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    {collection.name}
                                    {collection.is_featured && <span className="ml-1 text-yellow-500">⭐</span>}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Images
                </h3>

                <div className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            placeholder="URL de l'image"
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={addImage}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={image}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(image)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tags
                </h3>

                <div className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ajouter un tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    SEO
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Titre SEO
                        </label>
                        <input
                            type="text"
                            value={formData.meta_title}
                            onChange={(e) => handleInputChange('meta_title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description SEO
                        </label>
                        <textarea
                            value={formData.meta_description}
                            onChange={(e) => handleInputChange('meta_description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Options
                </h3>

                <div className="flex items-center gap-6">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Produit actif</span>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mise en avant</span>
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Annuler
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sauvegarde...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Sauvegarder
                        </>
                    )}
                </button>
            </div>
        </motion.form>
    );
}
