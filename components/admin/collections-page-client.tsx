'use client';

import { motion } from 'framer-motion';
import {
    Edit,
    Eye,
    EyeOff,
    Folder,
    Image as ImageIcon,
    Plus,
    Search,
    SortAsc,
    SortDesc,
    Star,
    StarOff,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    created_at: string;
    updated_at: string;
    product_count?: number;
}

export default function CollectionsPageClient() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [featuredFilter, setFeaturedFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        banner_url: '',
        is_active: true,
        is_featured: false,
        sort_order: 0,
        meta_title: '',
        meta_description: ''
    });

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/admin/collections');

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCollections(data.collections);
                } else {
                    setError(data.error || 'Erreur lors du chargement');
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Erreur lors du chargement');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des collections:', error);
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/admin/collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setShowCreateForm(false);
                    resetForm();
                    loadCollections();
                } else {
                    setError(data.error || 'Erreur lors de la création');
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Erreur lors de la création');
            }
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            setError('Erreur de connexion');
        }
    };

    const handleUpdateCollection = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingCollection) return;

        try {
            const response = await fetch(`/api/admin/collections/${editingCollection.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setEditingCollection(null);
                    resetForm();
                    loadCollections();
                } else {
                    setError(data.error || 'Erreur lors de la mise à jour');
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setError('Erreur de connexion');
        }
    };

    const handleDeleteCollection = async (collectionId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette collection ?')) return;

        try {
            const response = await fetch(`/api/admin/collections/${collectionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                loadCollections();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setError('Erreur de connexion');
        }
    };

    const toggleCollectionStatus = async (collectionId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/collections/${collectionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_active: !currentStatus }),
            });

            if (response.ok) {
                loadCollections();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setError('Erreur de connexion');
        }
    };

    const toggleFeaturedStatus = async (collectionId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/collections/${collectionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_featured: !currentStatus }),
            });

            if (response.ok) {
                loadCollections();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setError('Erreur de connexion');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            image_url: '',
            banner_url: '',
            is_active: true,
            is_featured: false,
            sort_order: 0,
            meta_title: '',
            meta_description: ''
        });
    };

    const handleEdit = (collection: Collection) => {
        setEditingCollection(collection);
        setFormData({
            name: collection.name,
            slug: collection.slug,
            description: collection.description || '',
            image_url: collection.image_url || '',
            banner_url: collection.banner_url || '',
            is_active: collection.is_active,
            is_featured: collection.is_featured,
            sort_order: collection.sort_order,
            meta_title: collection.meta_title || '',
            meta_description: collection.meta_description || ''
        });
    };

    const handleCancel = () => {
        setShowCreateForm(false);
        setEditingCollection(null);
        resetForm();
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            slug: generateSlug(name)
        }));
    };

    // Filtrage et tri
    const filteredCollections = collections.filter(collection => {
        const matchesSearch = searchTerm === '' ||
            collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collection.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && collection.is_active) ||
            (statusFilter === 'inactive' && !collection.is_active);

        const matchesFeatured = featuredFilter === 'all' ||
            (featuredFilter === 'featured' && collection.is_featured) ||
            (featuredFilter === 'not-featured' && !collection.is_featured);

        return matchesSearch && matchesStatus && matchesFeatured;
    });

    const sortedCollections = [...filteredCollections].sort((a, b) => {
        let aValue: any = a[sortBy as keyof Collection];
        let bValue: any = b[sortBy as keyof Collection];

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur de chargement</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadCollections}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
                            <p className="mt-2 text-gray-600">
                                Gérez les collections de produits de votre boutique
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadCollections}
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                Actualiser
                            </button>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Nouvelle collection
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtres et recherche */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recherche
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher dans les collections..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="active">Actives</option>
                                <option value="inactive">Inactives</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mise en avant
                            </label>
                            <select
                                value={featuredFilter}
                                onChange={(e) => setFeaturedFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Toutes</option>
                                <option value="featured">Mises en avant</option>
                                <option value="not-featured">Non mises en avant</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tri
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="name">Nom</option>
                                    <option value="created_at">Date de création</option>
                                    <option value="sort_order">Ordre</option>
                                    <option value="product_count">Nombre de produits</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulaire de création/édition */}
                {(showCreateForm || editingCollection) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {editingCollection ? 'Modifier la collection' : 'Nouvelle collection'}
                        </h2>

                        <form onSubmit={editingCollection ? handleUpdateCollection : handleCreateCollection} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Slug *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL de l'image
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL de la bannière
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.banner_url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, banner_url: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Titre SEO
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ordre de tri
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description SEO
                                </label>
                                <textarea
                                    value={formData.meta_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Collection active</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Mise en avant</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingCollection ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Liste des collections */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Chargement des collections...</p>
                        </div>
                    ) : sortedCollections.length === 0 ? (
                        <div className="p-8 text-center">
                            <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Aucune collection trouvée</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {sortedCollections.map((collection) => (
                                <motion.div
                                    key={collection.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Image de la collection */}
                                        <div className="flex-shrink-0">
                                            {collection.image_url ? (
                                                <img
                                                    src={collection.image_url}
                                                    alt={collection.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Informations de la collection */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {collection.name}
                                                        </h3>
                                                        {collection.is_featured && (
                                                            <Star className="h-5 w-5 text-yellow-500" />
                                                        )}
                                                        {!collection.is_active && (
                                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 text-sm">
                                                        {collection.description || 'Aucune description'}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                        <span>Slug: {collection.slug}</span>
                                                        <span>Ordre: {collection.sort_order}</span>
                                                        {collection.product_count !== undefined && (
                                                            <span>{collection.product_count} produit(s)</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 ml-4">
                                                    <button
                                                        onClick={() => toggleFeaturedStatus(collection.id, collection.is_featured)}
                                                        className={`p-2 rounded-lg transition-colors ${collection.is_featured
                                                                ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                                                                : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                                                            }`}
                                                        title={collection.is_featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                                                    >
                                                        {collection.is_featured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                                                    </button>

                                                    <button
                                                        onClick={() => toggleCollectionStatus(collection.id, collection.is_active)}
                                                        className={`p-2 rounded-lg transition-colors ${collection.is_active
                                                                ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                                                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                                            }`}
                                                        title={collection.is_active ? 'Désactiver' : 'Activer'}
                                                    >
                                                        {collection.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                    </button>

                                                    <button
                                                        onClick={() => handleEdit(collection)}
                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteCollection(collection.id)}
                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
