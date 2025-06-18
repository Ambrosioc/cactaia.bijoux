'use client';

import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    Globe,
    Image,
    Mail,
    Palette,
    Save,
    Settings,
    Store,
    Upload
} from 'lucide-react';
import { useState } from 'react';

interface ShopSettings {
    shopName: string;
    shopDescription: string;
    shopEmail: string;
    shopPhone: string;
    shopAddress: string;
    shopLogo: string;
    shopFavicon: string;
    primaryColor: string;
    secondaryColor: string;
    currency: string;
    timezone: string;
    language: string;
}

export default function SettingsPage() {
    const { isActiveAdmin } = useUser();
    const [settings, setSettings] = useState<ShopSettings>({
        shopName: 'Cactaia.Bijoux',
        shopDescription: 'Bijoux écoresponsables et élégants',
        shopEmail: 'contact@cactaiabijoux.fr',
        shopPhone: '+33 1 23 45 67 89',
        shopAddress: '42 rue Maurice Violette, 28600 Luisant, France',
        shopLogo: '',
        shopFavicon: '',
        primaryColor: '#4A7C59',
        secondaryColor: '#F5F5F4',
        currency: 'EUR',
        timezone: 'Europe/Paris',
        language: 'fr',
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleInputChange = (field: keyof ShopSettings, value: string) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // Simuler la sauvegarde
            await new Promise(resolve => setTimeout(resolve, 1500));

            setMessage({
                type: 'success',
                text: 'Paramètres sauvegardés avec succès'
            });

            // Effacer le message après 5 secondes
            setTimeout(() => setMessage(null), 5000);

        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Erreur lors de la sauvegarde des paramètres'
            });
        } finally {
            setSaving(false);
        }
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-medium mb-2">Paramètres de la boutique</h1>
                    <p className="text-muted-foreground">
                        Configurez les paramètres globaux de votre boutique
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary flex items-center gap-2 px-6 py-2"
                >
                    {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations générales */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-lg shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Store className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-medium">Informations générales</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Nom de la boutique
                            </label>
                            <input
                                type="text"
                                value={settings.shopName}
                                onChange={(e) => handleInputChange('shopName', e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                value={settings.shopDescription}
                                onChange={(e) => handleInputChange('shopDescription', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email de contact
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={settings.shopEmail}
                                    onChange={(e) => handleInputChange('shopEmail', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                value={settings.shopPhone}
                                onChange={(e) => handleInputChange('shopPhone', e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Adresse
                            </label>
                            <textarea
                                value={settings.shopAddress}
                                onChange={(e) => handleInputChange('shopAddress', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Apparence */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Palette className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-medium">Apparence</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Logo de la boutique
                            </label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">
                                    Glissez votre logo ici ou cliquez pour parcourir
                                </p>
                                <button className="btn btn-outline text-xs px-3 py-1">
                                    Choisir un fichier
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Favicon
                            </label>
                            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                                <Image className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground mb-2">
                                    Format ICO ou PNG (32x32px)
                                </p>
                                <button className="btn btn-outline text-xs px-3 py-1">
                                    Choisir un fichier
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Couleur primaire
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.primaryColor}
                                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                        className="w-12 h-10 border border-input rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.primaryColor}
                                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Couleur secondaire
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.secondaryColor}
                                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                        className="w-12 h-10 border border-input rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.secondaryColor}
                                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Localisation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-lg shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Globe className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-medium">Localisation</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Devise
                            </label>
                            <select
                                value={settings.currency}
                                onChange={(e) => handleInputChange('currency', e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">Dollar US ($)</option>
                                <option value="GBP">Livre Sterling (£)</option>
                                <option value="CHF">Franc Suisse (CHF)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Fuseau horaire
                            </label>
                            <select
                                value={settings.timezone}
                                onChange={(e) => handleInputChange('timezone', e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                                <option value="Europe/London">Europe/London (UTC+0)</option>
                                <option value="America/New_York">America/New_York (UTC-5)</option>
                                <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Langue
                            </label>
                            <select
                                value={settings.language}
                                onChange={(e) => handleInputChange('language', e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Sécurité et maintenance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-lg shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Settings className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-medium">Sécurité et maintenance</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h3 className="text-sm font-medium text-yellow-800 mb-2">
                                Mode maintenance
                            </h3>
                            <p className="text-sm text-yellow-700 mb-3">
                                Activez le mode maintenance pour effectuer des mises à jour sans perturber l'expérience utilisateur.
                            </p>
                            <button className="btn btn-outline text-yellow-700 border-yellow-300 hover:bg-yellow-100 text-xs px-3 py-1">
                                Activer le mode maintenance
                            </button>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">
                                Sauvegarde des données
                            </h3>
                            <p className="text-sm text-blue-700 mb-3">
                                Dernière sauvegarde : Aujourd'hui à 03:00
                            </p>
                            <button className="btn btn-outline text-blue-700 border-blue-300 hover:bg-blue-100 text-xs px-3 py-1">
                                Créer une sauvegarde
                            </button>
                        </div>

                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="text-sm font-medium text-red-800 mb-2">
                                Zone de danger
                            </h3>
                            <p className="text-sm text-red-700 mb-3">
                                Actions irréversibles qui affectent l'ensemble de la boutique.
                            </p>
                            <button className="btn btn-outline text-red-700 border-red-300 hover:bg-red-100 text-xs px-3 py-1">
                                Réinitialiser la boutique
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}