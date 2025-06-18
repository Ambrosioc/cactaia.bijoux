'use client';

import { createClient } from '@/lib/supabase/client';
import type { Address, AddressInsert } from '@/lib/supabase/types';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Check,
    Edit3,
    Home,
    MapPin,
    Phone,
    Plus,
    Star,
    Trash2,
    User,
    X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AddressFormData {
    nom_complet: string;
    ligne_1: string;
    ligne_2: string;
    code_postal: string;
    ville: string;
    pays: string;
    telephone: string;
    est_principale: boolean;
}

const initialFormData: AddressFormData = {
    nom_complet: '',
    ligne_1: '',
    ligne_2: '',
    code_postal: '',
    ville: '',
    pays: 'France',
    telephone: '',
    est_principale: false,
};

export default function AddressesPage() {
    const {
        user,
        isAuthenticated,
        isActiveUser,
        displayName,
        loading: userLoading
    } = useUser();

    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [formData, setFormData] = useState<AddressFormData>(initialFormData);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAccess = async () => {
            if (userLoading) return;

            if (!isAuthenticated) {
                router.push('/connexion');
                return;
            }

            if (!user) {
                return;
            }

            if (!isActiveUser) {
                router.push('/admin');
                return;
            }

            await loadAddresses();
            setLoading(false);
        };

        checkAccess();
    }, [isAuthenticated, user, isActiveUser, userLoading, router]);

    const loadAddresses = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('est_principale', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setAddresses(data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des adresses:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors du chargement des adresses'
            });
        }
    };

    const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
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

        if (!formData.nom_complet.trim()) {
            newErrors.nom_complet = 'Le nom complet est obligatoire';
        }
        if (!formData.ligne_1.trim()) {
            newErrors.ligne_1 = 'L\'adresse est obligatoire';
        }
        if (!formData.code_postal.trim()) {
            newErrors.code_postal = 'Le code postal est obligatoire';
        } else if (!/^\d{5}$/.test(formData.code_postal)) {
            newErrors.code_postal = 'Le code postal doit contenir 5 chiffres';
        }
        if (!formData.ville.trim()) {
            newErrors.ville = 'La ville est obligatoire';
        }
        if (!formData.telephone.trim()) {
            newErrors.telephone = 'Le téléphone est obligatoire';
        } else if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(formData.telephone.replace(/\s/g, ''))) {
            newErrors.telephone = 'Format de téléphone invalide';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !user) return;

        setSaving(true);
        setMessage(null);

        try {
            if (editingAddress) {
                // Mise à jour d'une adresse existante
                const { error } = await supabase
                    .from('addresses')
                    .update({
                        nom_complet: formData.nom_complet,
                        ligne_1: formData.ligne_1,
                        ligne_2: formData.ligne_2 || null,
                        code_postal: formData.code_postal,
                        ville: formData.ville,
                        pays: formData.pays,
                        telephone: formData.telephone,
                        est_principale: formData.est_principale,
                    })
                    .eq('id', editingAddress.id);

                if (error) throw error;

                setMessage({
                    type: 'success',
                    text: 'Adresse mise à jour avec succès'
                });
            } else {
                // Création d'une nouvelle adresse
                const addressData: AddressInsert = {
                    user_id: user.id,
                    nom_complet: formData.nom_complet,
                    ligne_1: formData.ligne_1,
                    ligne_2: formData.ligne_2 || null,
                    code_postal: formData.code_postal,
                    ville: formData.ville,
                    pays: formData.pays,
                    telephone: formData.telephone,
                    est_principale: formData.est_principale,
                };

                const { error } = await supabase
                    .from('addresses')
                    .insert(addressData);

                if (error) throw error;

                setMessage({
                    type: 'success',
                    text: 'Adresse ajoutée avec succès'
                });
            }

            // Recharger les adresses et fermer le formulaire
            await loadAddresses();
            handleCloseForm();

            // Effacer le message après 5 secondes
            setTimeout(() => setMessage(null), 5000);

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la sauvegarde de l\'adresse'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            nom_complet: address.nom_complet,
            ligne_1: address.ligne_1,
            ligne_2: address.ligne_2 || '',
            code_postal: address.code_postal,
            ville: address.ville,
            pays: address.pays,
            telephone: address.telephone,
            est_principale: address.est_principale,
        });
        setShowForm(true);
    };

    const handleDelete = async (addressId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
            return;
        }

        setDeleting(addressId);

        try {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', addressId);

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Adresse supprimée avec succès'
            });

            await loadAddresses();

            // Effacer le message après 5 secondes
            setTimeout(() => setMessage(null), 5000);

        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la suppression de l\'adresse'
            });
        } finally {
            setDeleting(null);
        }
    };

    const handleSetPrimary = async (addressId: string) => {
        try {
            const { error } = await supabase
                .from('addresses')
                .update({ est_principale: true })
                .eq('id', addressId);

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Adresse principale mise à jour'
            });

            await loadAddresses();

            // Effacer le message après 3 secondes
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la mise à jour de l\'adresse principale'
            });
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingAddress(null);
        setFormData(initialFormData);
        setErrors({});
        setMessage(null);
    };

    const handleNewAddress = () => {
        // Pré-remplir avec les données utilisateur si disponibles
        setFormData({
            ...initialFormData,
            nom_complet: user ? `${user.prenom} ${user.nom}`.trim() : '',
            telephone: user?.telephone || '',
            est_principale: addresses.length === 0, // Première adresse = principale par défaut
        });
        setEditingAddress(null);
        setShowForm(true);
    };

    if (loading || userLoading || !user) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isActiveUser) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="heading-lg mb-4">Accès non autorisé</h1>
                    <p className="text-muted-foreground mb-6">
                        Vous devez être en mode utilisateur pour accéder à cette page.
                    </p>
                    <Link href="/admin" className="btn btn-primary">
                        Aller à l'administration
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-primary/5 to-secondary">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/compte"
                            className="btn btn-outline flex items-center gap-2 px-4 py-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour au compte
                        </Link>
                        <div>
                            <h1 className="heading-lg">Mes adresses</h1>
                            <p className="text-muted-foreground">
                                Gérez vos adresses de livraison
                            </p>
                        </div>
                    </div>

                    {!showForm && (
                        <button
                            onClick={handleNewAddress}
                            className="btn btn-primary flex items-center gap-2 px-4 py-2"
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter une adresse
                        </button>
                    )}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Liste des adresses */}
                    <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        {addresses.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-lg shadow-sm text-center"
                            >
                                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-medium mb-2">Aucune adresse enregistrée</h3>
                                <p className="text-muted-foreground mb-6">
                                    Ajoutez votre première adresse de livraison pour faciliter vos commandes.
                                </p>
                                <button
                                    onClick={handleNewAddress}
                                    className="btn btn-primary px-6 py-2"
                                >
                                    Ajouter une adresse
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {addresses.map((address, i) => (
                                    <motion.div
                                        key={address.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: i * 0.1 }}
                                        className="bg-white p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-medium">{address.nom_complet}</h3>
                                                    {address.est_principale && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                                            <Star className="h-3 w-3 fill-current" />
                                                            Adresse principale
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-1 text-muted-foreground">
                                                    <p className="flex items-center gap-2">
                                                        <Home className="h-4 w-4" />
                                                        {address.ligne_1}
                                                    </p>
                                                    {address.ligne_2 && (
                                                        <p className="ml-6">{address.ligne_2}</p>
                                                    )}
                                                    <p className="ml-6">
                                                        {address.code_postal} {address.ville}
                                                    </p>
                                                    <p className="ml-6">{address.pays}</p>
                                                    <p className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4" />
                                                        {address.telephone}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4">
                                                {!address.est_principale && (
                                                    <button
                                                        onClick={() => handleSetPrimary(address.id)}
                                                        className="btn btn-outline text-xs px-3 py-1"
                                                        title="Définir comme adresse principale"
                                                    >
                                                        <Star className="h-3 w-3" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleEdit(address)}
                                                    className="btn btn-outline text-xs px-3 py-1"
                                                    title="Modifier"
                                                >
                                                    <Edit3 className="h-3 w-3" />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(address.id)}
                                                    disabled={deleting === address.id}
                                                    className="btn btn-outline text-red-500 hover:bg-red-50 text-xs px-3 py-1"
                                                    title="Supprimer"
                                                >
                                                    {deleting === address.id ? (
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                                                    ) : (
                                                        <Trash2 className="h-3 w-3" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Formulaire d'ajout/modification */}
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-medium">
                                        {editingAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
                                    </h3>
                                    <button
                                        onClick={handleCloseForm}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Nom complet *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={formData.nom_complet}
                                                onChange={(e) => handleInputChange('nom_complet', e.target.value)}
                                                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.nom_complet ? 'border-red-300' : 'border-input'
                                                    }`}
                                                placeholder="Nom complet pour la livraison"
                                            />
                                        </div>
                                        {errors.nom_complet && (
                                            <p className="text-red-500 text-xs mt-1">{errors.nom_complet}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Adresse *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.ligne_1}
                                            onChange={(e) => handleInputChange('ligne_1', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.ligne_1 ? 'border-red-300' : 'border-input'
                                                }`}
                                            placeholder="Numéro et nom de rue"
                                        />
                                        {errors.ligne_1 && (
                                            <p className="text-red-500 text-xs mt-1">{errors.ligne_1}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Complément d'adresse
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.ligne_2}
                                            onChange={(e) => handleInputChange('ligne_2', e.target.value)}
                                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Appartement, étage, etc."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Code postal *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.code_postal}
                                                onChange={(e) => handleInputChange('code_postal', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.code_postal ? 'border-red-300' : 'border-input'
                                                    }`}
                                                placeholder="75001"
                                                maxLength={5}
                                            />
                                            {errors.code_postal && (
                                                <p className="text-red-500 text-xs mt-1">{errors.code_postal}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Ville *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.ville}
                                                onChange={(e) => handleInputChange('ville', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.ville ? 'border-red-300' : 'border-input'
                                                    }`}
                                                placeholder="Paris"
                                            />
                                            {errors.ville && (
                                                <p className="text-red-500 text-xs mt-1">{errors.ville}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Pays
                                        </label>
                                        <select
                                            value={formData.pays}
                                            onChange={(e) => handleInputChange('pays', e.target.value)}
                                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="France">France</option>
                                            <option value="Belgique">Belgique</option>
                                            <option value="Suisse">Suisse</option>
                                            <option value="Luxembourg">Luxembourg</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Téléphone *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="tel"
                                                value={formData.telephone}
                                                onChange={(e) => handleInputChange('telephone', e.target.value)}
                                                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.telephone ? 'border-red-300' : 'border-input'
                                                    }`}
                                                placeholder="06 12 34 56 78"
                                            />
                                        </div>
                                        {errors.telephone && (
                                            <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.est_principale}
                                                    onChange={(e) => handleInputChange('est_principale', e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${formData.est_principale ? 'bg-primary border-primary' : 'border-input'
                                                    }`}>
                                                    {formData.est_principale && (
                                                        <Check className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm">
                                                Définir comme adresse principale
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleCloseForm}
                                            className="flex-1 btn btn-outline py-2"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 btn btn-primary py-2"
                                        >
                                            {saving ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Sauvegarde...</span>
                                                </div>
                                            ) : (
                                                editingAddress ? 'Modifier' : 'Ajouter'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}