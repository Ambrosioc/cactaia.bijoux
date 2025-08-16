'use client';

import { createClient } from '@/lib/supabase/client';
import type { User as UserProfile } from '@/lib/supabase/types';
import { useUser } from '@/stores/userStore';
import { useEffect, useState } from 'react';

interface PromotionCode {
    id: string;
    code: string;
    name: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_uses?: number;
    used_count?: number;
    valid_from: string;
    valid_until: string;
    active: boolean;
    created_at: string;
}

export default function UtilisateursClient() {
    const { user: currentUser, isActiveAdmin } = useUser();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [promotionCodes, setPromotionCodes] = useState<PromotionCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<'all' | 'user' | 'admin'>('all');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailContent, setEmailContent] = useState('');
    const [emailType, setEmailType] = useState<'individual' | 'group'>('individual');
    const [selectedPromotionCode, setSelectedPromotionCode] = useState<string>('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'emails' | 'promotions'>('users');

    const supabase = createClient();

    useEffect(() => {
        if (isActiveAdmin) {
            console.log('🔧 Composant utilisateurs chargé, isActiveAdmin:', isActiveAdmin);
            loadUsers();
            loadPromotionCodes();
        } else {
            console.log('⚠️ Utilisateur non admin, isActiveAdmin:', isActiveAdmin);
        }
    }, [isActiveAdmin]);

    // Debug: afficher l'état des codes promotionnels
    useEffect(() => {
        console.log('📊 État des codes promotionnels mis à jour:', {
            count: promotionCodes.length,
            codes: promotionCodes
        });
    }, [promotionCodes]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPromotionCodes = async () => {
        try {
            console.log('🔍 Chargement des codes promotionnels...');
            const response = await fetch('/api/stripe/promotion-codes');
            console.log('📡 Réponse API:', response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log('📊 Données reçues:', data);

                if (data.success && data.promotionCodes) {
                    setPromotionCodes(data.promotionCodes);
                    console.log(`✅ ${data.promotionCodes.length} codes promotionnels chargés`);
                } else {
                    console.warn('⚠️ Format de réponse inattendu:', data);
                    setPromotionCodes([]);
                }
            } else {
                const errorText = await response.text();
                console.error('❌ Erreur API:', response.status, errorText);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des codes promotionnels:', error);
        }
    };

    const promoteToAdmin = async (userId: string) => {
        if (!confirm('Promouvoir cet utilisateur administrateur ?')) return;

        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: 'admin', active_role: 'admin' })
                .eq('id', userId);

            if (error) throw error;

            alert('Utilisateur promu administrateur avec succès');
            await loadUsers();
        } catch (error) {
            alert('Erreur lors de la promotion de l\'utilisateur');
        } finally {
            setActionLoading(null);
        }
    };

    const demoteFromAdmin = async (userId: string) => {
        if (!confirm('Rétrograder cet administrateur ?')) return;

        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: 'user', active_role: 'user' })
                .eq('id', userId);

            if (error) throw error;

            alert('Administrateur rétrogradé avec succès');
            await loadUsers();
        } catch (error) {
            alert('Erreur lors de la rétrogradation de l\'utilisateur');
        } finally {
            setActionLoading(null);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Supprimer cet utilisateur ?')) return;

        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            alert('Utilisateur supprimé avec succès');
            await loadUsers();
        } catch (error) {
            alert('Erreur lors de la suppression de l\'utilisateur');
        } finally {
            setActionLoading(null);
        }
    };

    const sendEmail = async () => {
        if (!emailSubject || !emailContent) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            const response = await fetch('/api/admin/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: emailType,
                    subject: emailSubject,
                    content: emailContent,
                    userIds: emailType === 'individual' ? selectedUsers : undefined,
                    promotionCode: selectedPromotionCode
                })
            });

            if (response.ok) {
                alert('Email(s) envoyé(s) avec succès');
                setEmailDialogOpen(false);
                setEmailSubject('');
                setEmailContent('');
                setSelectedUsers([]);
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        } catch (error) {
            alert('Impossible d\'envoyer l\'email');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const getUserDisplayName = (user: UserProfile) => {
        if (user.prenom && user.nom) return `${user.prenom} ${user.nom}`;
        if (user.prenom) return user.prenom;
        if (user.nom) return user.nom;
        return user.email.split('@')[0];
    };

    if (!isActiveAdmin) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-medium mb-4">Accès non autorisé</h1>
                    <p className="text-muted-foreground">Vous devez être administrateur pour accéder à cette page.</p>
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
                    Gérez vos utilisateurs, envoyez des emails et des codes promotionnels
                </p>
            </div>

            {/* Onglets simples */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Utilisateurs
                        </button>
                        <button
                            onClick={() => setActiveTab('emails')}
                            className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'emails'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Emails
                        </button>
                        <button
                            onClick={() => setActiveTab('promotions')}
                            className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'promotions'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Codes Promotionnels
                        </button>
                    </nav>
                </div>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'users' && (
                /* Section Utilisateurs */
                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <h2 className="text-lg font-medium mb-4">Filtres et actions</h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom, prénom ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value as 'all' | 'user' | 'admin')}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tous les rôles</option>
                                <option value="user">Utilisateurs</option>
                                <option value="admin">Administrateurs</option>
                            </select>
                        </div>

                        {/* Statistiques */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                                <div className="text-sm text-gray-500">Total utilisateurs</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {users.filter(u => u.role === 'admin').length}
                                </div>
                                <div className="text-sm text-gray-500">Administrateurs</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {users.filter(u => u.role === 'user').length}
                                </div>
                                <div className="text-sm text-gray-500">Clients</div>
                            </div>
                        </div>
                    </div>

                    {/* Liste des utilisateurs */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">Liste des utilisateurs</h3>
                            <p className="text-sm text-gray-500">{filteredUsers.length} utilisateur(s) trouvé(s)</p>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Chargement des utilisateurs...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-lg font-medium mb-2">Aucun utilisateur trouvé</p>
                                    <p className="text-gray-500">
                                        {searchTerm || selectedRole !== 'all'
                                            ? 'Aucun utilisateur ne correspond à vos critères.'
                                            : 'Aucun utilisateur enregistré pour le moment.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-gray-200">
                                            <tr>
                                                <th className="text-left p-4 font-medium">Utilisateur</th>
                                                <th className="text-left p-4 font-medium">Email</th>
                                                <th className="text-left p-4 font-medium">Rôle</th>
                                                <th className="text-left p-4 font-medium">Inscription</th>
                                                <th className="text-left p-4 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredUsers.map((user, i) => {
                                                const isCurrentUser = user.id === currentUser?.id;

                                                return (
                                                    <tr key={user.id} className="hover:bg-gray-50">
                                                        <td className="p-4">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                                    <span className="text-blue-600 font-medium">
                                                                        {getUserDisplayName(user).charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {getUserDisplayName(user)}
                                                                        {isCurrentUser && (
                                                                            <span className="ml-2 text-xs text-gray-500">(Vous)</span>
                                                                        )}
                                                                    </div>
                                                                    {user.genre && (
                                                                        <div className="text-sm text-gray-500">{user.genre}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-sm">{user.email}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {user.role === 'admin' ? 'Administrateur' : 'Client'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-500">
                                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center space-x-2">
                                                                {user.role === 'user' ? (
                                                                    <button
                                                                        onClick={() => promoteToAdmin(user.id)}
                                                                        disabled={actionLoading === user.id}
                                                                        className="px-3 py-1 border border-green-300 text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors text-xs"
                                                                    >
                                                                        {actionLoading === user.id ? '...' : 'Promouvoir'}
                                                                    </button>
                                                                ) : (
                                                                    !isCurrentUser && (
                                                                        <button
                                                                            onClick={() => demoteFromAdmin(user.id)}
                                                                            disabled={actionLoading === user.id}
                                                                            className="px-3 py-1 border border-orange-300 text-orange-700 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors text-xs"
                                                                        >
                                                                            {actionLoading === user.id ? '...' : 'Rétrograder'}
                                                                        </button>
                                                                    )
                                                                )}

                                                                {!isCurrentUser && (
                                                                    <button
                                                                        onClick={() => deleteUser(user.id)}
                                                                        disabled={actionLoading === user.id}
                                                                        className="px-3 py-1 border border-red-300 text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors text-xs"
                                                                    >
                                                                        {actionLoading === user.id ? '...' : 'Supprimer'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'emails' && (
                /* Section Emails */
                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">Gestion des emails</h3>
                            <p className="text-sm text-gray-500">
                                Envoyez des emails individuels ou groupés à vos utilisateurs
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="text-center py-8">
                                <h4 className="text-lg font-medium mb-4">Envoi d'emails</h4>
                                <p className="text-gray-500 mb-6">
                                    Utilisez le bouton ci-dessous pour envoyer des emails à vos utilisateurs
                                </p>
                                <button
                                    onClick={() => setEmailDialogOpen(true)}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-lg"
                                >
                                    Envoyer un email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'promotions' && (
                /* Section Codes Promotionnels */
                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">Codes promotionnels</h3>
                            <p className="text-sm text-gray-500">
                                Gérez et distribuez vos codes promotionnels Stripe
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-500">
                                    {promotionCodes.length} code(s) trouvé(s)
                                </div>
                                <button
                                    onClick={loadPromotionCodes}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Actualiser
                                </button>
                            </div>

                            {promotionCodes.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-2">Aucun code promotionnel trouvé</p>
                                    <p className="text-sm text-gray-400">
                                        Créez des codes depuis la page Stripe pour les voir apparaître ici
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {promotionCodes.map((code) => (
                                        <div key={code.id} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-lg">{code.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Code: <code className="bg-white px-2 py-1 rounded border font-mono">{code.code}</code>
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                                        <span className="text-green-600 font-medium">
                                                            Réduction: {code.discount_value}
                                                            {code.discount_type === 'percentage' ? '%' : '€'}
                                                        </span>
                                                        {code.max_uses && (
                                                            <span className="text-blue-600">
                                                                Utilisations: {code.used_count || 0}/{code.max_uses}
                                                            </span>
                                                        )}
                                                        {code.valid_until && (
                                                            <span className="text-orange-600">
                                                                Valide jusqu'au: {new Date(code.valid_until).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${code.active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {code.active ? 'Actif' : 'Inactif'}
                                                    </span>
                                                    <div className="text-xs text-gray-500">
                                                        Créé le {new Date(code.created_at).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog Email simple */}
            {emailDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                        <h3 className="text-lg font-medium mb-4">Envoyer un email</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Type d'email</label>
                                <select
                                    value={emailType}
                                    onChange={(e) => setEmailType(e.target.value as 'individual' | 'group')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="individual">Email individuel</option>
                                    <option value="group">Email groupé</option>
                                </select>
                            </div>

                            {emailType === 'individual' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Utilisateurs sélectionnés</label>
                                    <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                                        {filteredUsers.map((user) => (
                                            <div key={user.id} className="flex items-center space-x-2 py-1">
                                                <input
                                                    type="checkbox"
                                                    id={user.id}
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedUsers([...selectedUsers, user.id]);
                                                        } else {
                                                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={user.id} className="text-sm">
                                                    {getUserDisplayName(user)} ({user.email})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Code promotionnel (optionnel)</label>
                                <select
                                    value={selectedPromotionCode}
                                    onChange={(e) => setSelectedPromotionCode(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Aucun code</option>
                                    {promotionCodes.map((code) => (
                                        <option key={code.id} value={code.id}>
                                            {code.name} - {code.code}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Sujet</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="Sujet de l'email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Contenu</label>
                                <textarea
                                    value={emailContent}
                                    onChange={(e) => setEmailContent(e.target.value)}
                                    placeholder="Contenu de l'email..."
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setEmailDialogOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={sendEmail}
                                disabled={!emailSubject || !emailContent}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                            >
                                Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bouton pour ouvrir le dialog email */}
            <div className="text-center">
                <button
                    onClick={() => setEmailDialogOpen(true)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Envoyer un email
                </button>
            </div>
        </div>
    );
}


