'use client';

import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/supabase/types';
import { formatPrice } from '@/lib/utils';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    Calendar,
    CreditCard,
    Download,
    Eye,
    Package,
    Search,
    User
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminOrdersPage() {
    const { isActiveAdmin } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const supabase = createClient();

    useEffect(() => {
        if (isActiveAdmin) {
            loadOrders();
        }
    }, [isActiveAdmin]);

    const loadOrders = async () => {
        try {
            setLoading(true);

            const { data: ordersData, error: ordersError } = await supabase
                .from('commandes')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) {
                throw ordersError;
            }

            // Récupérer les données utilisateur pour chaque commande
            const ordersWithUsers = await Promise.all(
                (ordersData || []).map(async (order) => {
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('nom, prenom, email')
                        .eq('id', order.user_id)
                        .single();

                    return {
                        ...order,
                        users: userError ? null : userData
                    };
                })
            );

            setOrders(ordersWithUsers);
        } catch (error) {
            console.error('Erreur lors du chargement des commandes:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors du chargement des commandes'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'payee':
                return 'bg-green-100 text-green-800';
            case 'en_attente':
                return 'bg-yellow-100 text-yellow-800';
            case 'echouee':
                return 'bg-red-100 text-red-800';
            case 'remboursee':
                return 'bg-blue-100 text-blue-800';
            case 'annulee':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'payee':
                return 'Payée';
            case 'en_attente':
                return 'En attente';
            case 'echouee':
                return 'Échouée';
            case 'remboursee':
                return 'Remboursée';
            case 'annulee':
                return 'Annulée';
            default:
                return status;
        }
    };

    // Filtrer les commandes
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ((order as any).users?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((order as any).users?.nom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((order as any).users?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = selectedStatus === 'all' || order.statut === selectedStatus;

        return matchesSearch && matchesStatus;
    });

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
                    <h1 className="text-3xl font-medium mb-2">Gestion des commandes</h1>
                    <p className="text-muted-foreground">
                        Consultez et gérez toutes les commandes
                    </p>
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

            {/* Filtres et recherche */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Recherche */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Rechercher par numéro, client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Filtre par statut */}
                    <div className="md:w-48">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="en_attente">En attente</option>
                            <option value="payee">Payées</option>
                            <option value="echouee">Échouées</option>
                            <option value="remboursee">Remboursées</option>
                            <option value="annulee">Annulées</option>
                        </select>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Total commandes:</span>
                            <span className="ml-2 font-medium">{orders.length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Payées:</span>
                            <span className="ml-2 font-medium">{orders.filter(o => o.statut === 'payee').length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">En attente:</span>
                            <span className="ml-2 font-medium">{orders.filter(o => o.statut === 'en_attente').length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">CA total:</span>
                            <span className="ml-2 font-medium">
                                {formatPrice(orders.filter(o => o.statut === 'payee').reduce((sum, o) => sum + o.montant_total, 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des commandes */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Chargement des commandes...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucune commande trouvée</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || selectedStatus !== 'all'
                                ? 'Aucune commande ne correspond à vos critères de recherche.'
                                : 'Aucune commande pour le moment.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Commande
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Montant
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
                                {filteredOrders.map((order, i) => {
                                    const user = (order as any).users;
                                    const products = Array.isArray(order.produits) ? order.produits : [];

                                    return (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {order.numero_commande}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {products.length} article(s)
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-foreground">
                                                            {user ? `${user.prenom} ${user.nom}` : 'Utilisateur supprimé'}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {user?.email || 'Email non disponible'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                                                    <div className="text-sm">
                                                        <div className="text-foreground">
                                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            {new Date(order.created_at).toLocaleTimeString('fr-FR', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <CreditCard className="h-4 w-4 text-muted-foreground mr-2" />
                                                    <span className="text-sm font-medium text-foreground">
                                                        {formatPrice(order.montant_total)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.statut)}`}>
                                                    {getStatusLabel(order.statut)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={`/admin/commandes/${order.id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Voir les détails"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    {order.facture_url && (
                                                        <a
                                                            href={order.facture_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Télécharger la facture"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}