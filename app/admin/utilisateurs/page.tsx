'use client';

import { createClient } from '@/lib/supabase/client';
import type { User as UserProfile } from '@/lib/supabase/types';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    Crown,
    Mail,
    Search,
    Trash2,
    User,
    UserX
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UsersManagementPage() {
    const { user: currentUser, isActiveAdmin } = useUser();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<'all' | 'user' | 'admin'>('all');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        if (isActiveAdmin) {
            loadUsers();
        }
    }, [isActiveAdmin]);

    const loadUsers = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setUsers(data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors du chargement des utilisateurs'
            });
        } finally {
            setLoading(false);
        }
    };

    const promoteToAdmin = async (userId: string) => {
        if (!currentUser || currentUser.role !== 'admin') {
            setMessage({
                type: 'error',
                text: 'Seuls les administrateurs peuvent promouvoir des utilisateurs'
            });
            return;
        }

        if (!confirm('Êtes-vous sûr de vouloir promouvoir cet utilisateur au rang d\'administrateur ?')) {
            return;
        }

        setActionLoading(userId);

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    role: 'admin',
                    active_role: 'admin' // Par défaut, un nouvel admin est en mode admin
                })
                .eq('id', userId);

            if (error) {
                throw error;
            }

            setMessage({
                type: 'success',
                text: 'Utilisateur promu administrateur avec succès'
            });

            await loadUsers();

            // Effacer le message après 5 secondes
            setTimeout(() => setMessage(null), 5000);

        } catch (error) {
            console.error('Erreur lors de la promotion:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la promotion de l\'utilisateur'
            });
        } finally {
            setActionLoading(null);
        }
    };

    const demoteFromAdmin = async (userId: string) => {
        if (!currentUser || currentUser.role !== 'admin') {
            setMessage({
                type: 'error',
                text: 'Seuls les administrateurs peuvent rétrograder des utilisateurs'
            });
            return;
        }

        if (userId === currentUser.id) {
            setMessage({
                type: 'error',
                text: 'Vous ne pouvez pas vous rétrograder vous-même'
            });
            return;
        }

        if (!confirm('Êtes-vous sûr de vouloir rétrograder cet administrateur en utilisateur ?')) {
            return;
        }

        setActionLoading(userId);

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    role: 'user',
                    active_role: 'user'
                })
                .eq('id', userId);

            if (error) {
                throw error;
            }

            setMessage({
                type: 'success',
                text: 'Administrateur rétrogradé en utilisateur avec succès'
            });

            await loadUsers();

            // Effacer le message après 5 secondes
            setTimeout(() => setMessage(null), 5000);

        } catch (error) {
            console.error('Erreur lors de la rétrogradation:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la rétrogradation de l\'utilisateur'
            });
        } finally {
            setActionLoading(null);
        }
    };

    const softDeleteUser = async (userId: string) => {
        if (!currentUser || currentUser.role !== 'admin') {
            setMessage({
                type: 'error',
                text: 'Seuls les administrateurs peuvent supprimer des utilisateurs'
            });
            return;
        }

        if (userId === currentUser.id) {
            setMessage({
                type: 'error',
                text: 'Vous ne pouvez pas vous supprimer vous-même'
            });
            return;
        }

        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
            return;
        }

        setActionLoading(userId);

        try {
            // Pour l'instant, on fait une vraie suppression
            // Dans un vrai projet, on ferait un soft delete avec un champ deleted_at
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) {
                throw error;
            }

            setMessage({
                type: 'success',
                text: 'Utilisateur supprimé avec succès'
            });

            await loadUsers();

            // Effacer le message après 5 secondes
            setTimeout(() => setMessage(null), 5000);

        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la suppression de l\'utilisateur'
            });
        } finally {
            setActionLoading(null);
        }
    };

    // Filtrer les utilisateurs
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = selectedRole === 'all' || user.role === selectedRole;

        return matchesSearch && matchesRole;
    });

    const getUserDisplayName = (user: UserProfile) => {
        if (user.prenom && user.nom) {
            return `${user.prenom} ${user.nom}`;
        } else if (user.prenom) {
            return user.prenom;
        } else if (user.nom) {
            return user.nom;
        }
        return user.email.split('@')[0];
    };

    const getRoleIcon = (role: string | null) => {
        return role === 'admin' ? Crown : User;
    };

    const getRoleBadgeColor = (role: string | null) => {
        return role === 'admin'
            ? 'bg-purple-100 text-purple-700 border-purple-200'
            : 'bg-blue-100 text-blue-700 border-blue-200';
    };

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
            <div className="mb-8">
                <h1 className="text-3xl font-medium mb-2">Gestion des utilisateurs</h1>
                <p className="text-muted-foreground">
                    Gérez les comptes utilisateurs et leurs permissions
                </p>
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
                                placeholder="Rechercher par nom, prénom ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Filtre par rôle */}
                    <div className="md:w-48">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as 'all' | 'user' | 'admin')}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">Tous les rôles</option>
                            <option value="user">Utilisateurs</option>
                            <option value="admin">Administrateurs</option>
                        </select>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Total utilisateurs:</span>
                            <span className="ml-2 font-medium">{users.length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Administrateurs:</span>
                            <span className="ml-2 font-medium">{users.filter(u => u.role === 'admin').length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Clients:</span>
                            <span className="ml-2 font-medium">{users.filter(u => u.role === 'user').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Chargement des utilisateurs...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || selectedRole !== 'all'
                                ? 'Aucun utilisateur ne correspond à vos critères de recherche.'
                                : 'Aucun utilisateur enregistré pour le moment.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Utilisateur
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Rôle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Inscription
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((user, i) => {
                                    const RoleIcon = getRoleIcon(user.role);
                                    const isCurrentUser = user.id === currentUser?.id;

                                    return (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-foreground">
                                                            {getUserDisplayName(user)}
                                                            {isCurrentUser && (
                                                                <span className="ml-2 text-xs text-muted-foreground">(Vous)</span>
                                                            )}
                                                        </div>
                                                        {user.genre && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {user.genre}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                                                    <span className="text-sm text-foreground">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                    <RoleIcon className="h-3 w-3 mr-1" />
                                                    {user.role === 'admin' ? 'Administrateur' : 'Client'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    {user.role === 'user' ? (
                                                        <button
                                                            onClick={() => promoteToAdmin(user.id)}
                                                            disabled={actionLoading === user.id}
                                                            className="inline-flex items-center px-3 py-1 border border-green-300 text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors text-xs"
                                                            title="Promouvoir administrateur"
                                                        >
                                                            {actionLoading === user.id ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                                                            ) : (
                                                                <>
                                                                    <Crown className="h-3 w-3 mr-1" />
                                                                    Promouvoir
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        !isCurrentUser && (
                                                            <button
                                                                onClick={() => demoteFromAdmin(user.id)}
                                                                disabled={actionLoading === user.id}
                                                                className="inline-flex items-center px-3 py-1 border border-orange-300 text-orange-700 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors text-xs"
                                                                title="Rétrograder en utilisateur"
                                                            >
                                                                {actionLoading === user.id ? (
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-700"></div>
                                                                ) : (
                                                                    <>
                                                                        <UserX className="h-3 w-3 mr-1" />
                                                                        Rétrograder
                                                                    </>
                                                                )}
                                                            </button>
                                                        )
                                                    )}

                                                    {!isCurrentUser && (
                                                        <button
                                                            onClick={() => softDeleteUser(user.id)}
                                                            disabled={actionLoading === user.id}
                                                            className="inline-flex items-center px-3 py-1 border border-red-300 text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors text-xs"
                                                            title="Supprimer l'utilisateur"
                                                        >
                                                            {actionLoading === user.id ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
                                                            ) : (
                                                                <>
                                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                                    Supprimer
                                                                </>
                                                            )}
                                                        </button>
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