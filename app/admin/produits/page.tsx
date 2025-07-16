'use client';

import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/supabase/types';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    Edit3,
    Eye,
    Package,
    Plus,
    Search,
    Star,
    ToggleLeft,
    ToggleRight,
    Trash2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProductsManagementPage() {
    const { isActiveAdmin } = useUser();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        if (isActiveAdmin) {
            loadProducts();
        }
    }, [isActiveAdmin]);

    const loadProducts = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('produits')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setProducts(data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors du chargement des produits'
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
        setActionLoading(productId);

        try {
            const { error } = await supabase
                .from('produits')
                .update({ est_actif: !currentStatus })
                .eq('id', productId);

            if (error) {
                throw error;
            }

            setMessage({
                type: 'success',
                text: `Produit ${!currentStatus ? 'activé' : 'désactivé'} avec succès`
            });

            await loadProducts();

            // Effacer le message après 3 secondes
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la mise à jour du produit'
            });
        } finally {
            setActionLoading(null);
        }
    };

    const deleteProduct = async (productId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
            return;
        }

        setActionLoading(productId);

        try {
            // Supprimer les images du storage
            const product = products?.find(p => p.id === productId);
            if (product?.images?.length && product.images.length > 0) {
                const filePaths = product.images?.map(url => {
                    const urlParts = url.split('/');
                    const bucketIndex = urlParts.findIndex(part => part === 'produits');
                    return bucketIndex !== -1 ? urlParts.slice(bucketIndex).join('/') : null;
                }).filter(Boolean);

                if (filePaths.length > 0) {
                    await supabase.storage
                        .from('produits')
                        .remove(filePaths as string[]);
                }
            }

            // Supprimer le produit
            const { error } = await supabase
                .from('produits')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Produit supprimé avec succès'
            });

            await loadProducts();

            // Effacer le message après 5 secondes
            setTimeout(() => setMessage(null), 5000);

        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la suppression du produit'
            });
        } finally {
            setActionLoading(null);
        }
    };

    // Filtrer les produits
    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || product.categorie === selectedCategory;

        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'active' && product.est_actif) ||
            (selectedStatus === 'inactive' && !product.est_actif) ||
            (selectedStatus === 'featured' && product.est_mis_en_avant);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const categories = [...new Set(products.map(product => product.categorie))];

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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-medium mb-2">Gestion des produits</h1>
                    <p className="text-muted-foreground">
                        Gérez votre catalogue de produits
                    </p>
                </div>
                <Link
                    href="/admin/produits/nouveau"
                    className="btn btn-primary flex items-center gap-2 px-4 py-2"
                >
                    <Plus className="h-4 w-4" />
                    Ajouter un produit
                </Link>
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

            {/* Filtres et recherche */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Recherche */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Rechercher un produit..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Filtre par catégorie */}
                    <div className="md:w-48">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">Toutes les catégories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre par statut */}
                    <div className="md:w-48">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actifs</option>
                            <option value="inactive">Inactifs</option>
                            <option value="featured">Mis en avant</option>
                        </select>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Total produits:</span>
                            <span className="ml-2 font-medium">{products.length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Actifs:</span>
                            <span className="ml-2 font-medium">{products.filter(p => p.est_actif === true).length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Mis en avant:</span>
                            <span className="ml-2 font-medium">{products.filter(p => p.est_mis_en_avant === true).length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Prix moyen:</span>
                            <span className="ml-2 font-medium">
                                {products.length > 0
                                    ? (products.reduce((sum, p) => sum + p.prix, 0) / products.length).toFixed(2)
                                    : '0.00'
                                }€
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des produits */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Chargement des produits...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                                ? 'Aucun produit ne correspond à vos critères de recherche.'
                                : 'Aucun produit dans votre catalogue pour le moment.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Produit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Catégorie
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Prix
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredProducts.map((product, i) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                                                        {Array.isArray(product?.images) && product.images.length > 0 ? (
                                                            <Image
                                                                src={product.images[0]}
                                                                alt={product.nom}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full">
                                                                <Package className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {product.nom}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        SKU: {product.sku || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-foreground">{product.categorie}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <span className="font-medium text-foreground">
                                                    {product.prix.toFixed(2)}€
                                                </span>
                                                {product.prix_promo && (
                                                    <div className="text-xs text-red-600">
                                                        Promo: {product.prix_promo.toFixed(2)}€
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm ${product.stock === 0 ? 'text-red-600' : 'text-foreground'
                                                }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => toggleProductStatus(product.id, product.est_actif === true)}
                                                        disabled={actionLoading === product.id}
                                                        className="flex items-center"
                                                    >
                                                        {actionLoading === product.id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                        ) : product.est_actif === true ? (
                                                            <ToggleRight className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                        )}
                                                        <span className={`ml-1 text-xs ${product.est_actif === true ? 'text-green-600' : 'text-gray-500'
                                                            }`}>
                                                            {product.est_actif === true ? 'Actif' : 'Inactif'}
                                                        </span>
                                                    </button>
                                                </div>
                                                {product.est_mis_en_avant && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/produit/${product.id}`}
                                                    target="_blank"
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Voir le produit"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/produits/edit/${product.id}`}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Modifier"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    disabled={actionLoading === product.id}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Supprimer"
                                                >
                                                    {actionLoading === product.id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}