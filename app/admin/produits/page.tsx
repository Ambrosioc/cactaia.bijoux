'use client';

import { products } from '@/lib/data/products';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    Edit3,
    Eye,
    MoreHorizontal,
    Package,
    Plus,
    Search,
    Star,
    Trash2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductsManagementPage() {
    const { isActiveAdmin } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Filtrer les produits
    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'new' && product.isNew) ||
            (selectedStatus === 'bestseller' && product.isBestseller);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const categories = [...new Set(products.map(product => product.category))];

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
                <button className="btn btn-primary flex items-center gap-2 px-4 py-2">
                    <Plus className="h-4 w-4" />
                    Ajouter un produit
                </button>
            </div>

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
                            <option value="new">Nouveautés</option>
                            <option value="bestseller">Meilleures ventes</option>
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
                            <span className="text-muted-foreground">Nouveautés:</span>
                            <span className="ml-2 font-medium">{products.filter(p => p.isNew).length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Meilleures ventes:</span>
                            <span className="ml-2 font-medium">{products.filter(p => p.isBestseller).length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Prix moyen:</span>
                            <span className="ml-2 font-medium">
                                {(products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)}€
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des produits */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {filteredProducts.length === 0 ? (
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
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Collections
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
                                                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        ID: {product.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-foreground">{product.category}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-foreground">
                                                {product.price.toFixed(2)}€
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                {product.isNew && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Nouveau
                                                    </span>
                                                )}
                                                {product.isBestseller && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Best-seller
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {product.collections.slice(0, 2).map(collection => (
                                                    <span
                                                        key={collection}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {collection}
                                                    </span>
                                                ))}
                                                {product.collections.length > 2 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        +{product.collections.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/produit/${product.slug}`}
                                                    target="_blank"
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Voir le produit"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Modifier"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Plus d'actions"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
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