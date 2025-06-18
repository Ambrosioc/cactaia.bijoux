'use client';

import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/supabase/types';
import { formatPrice } from '@/lib/utils';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, Eye, Package } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function OrdersList() {
    const { user } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        if (!user) return;

        try {
            console.log('Chargement des commandes pour l\'utilisateur:', user.id);

            const { data, error } = await supabase
                .from('commandes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            console.log('Résultat de la requête:', { data, error });

            if (error) {
                throw error;
            }

            console.log('Commandes trouvées:', data?.length || 0);
            setOrders(data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des commandes:', error);
            setError('Erreur lors du chargement des commandes');
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

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des commandes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={loadOrders}
                    className="btn btn-primary px-6 py-2"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucune commande</h3>
                <p className="text-muted-foreground mb-6">
                    Vous n&apos;avez pas encore passé de commande.
                </p>
                <Link
                    href="/boutique"
                    className="btn btn-primary px-6 py-2"
                >
                    Découvrir nos produits
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order, i) => (
                <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-medium text-lg">{order.numero_commande}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.statut)}`}>
                                    {getStatusLabel(order.statut)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    <span>{formatPrice(order.montant_total)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span>
                                        {Array.isArray(order.produits) ? order.produits.length : 0} article(s)
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href={`/compte/commandes/${order.id}`}
                                className="btn btn-outline flex items-center gap-2 px-4 py-2"
                            >
                                <Eye className="h-4 w-4" />
                                Voir détails
                            </Link>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
} 