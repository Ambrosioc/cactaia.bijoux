'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    Mail,
    Palette,
    RotateCcw,
    Save,
    Settings,
    Store
} from 'lucide-react';
import { useState } from 'react';

interface ShopSettings {
    shopName: string;
    shopDescription: string;
    shopEmail: string;
    shopPhone: string;
    shopAddress: string;
}

export default function SettingsPage() {
    const { isActiveAdmin } = useUser();
    const { colors, updateColors, resetColors } = useTheme();
    const [settings, setSettings] = useState<ShopSettings>({
        shopName: 'Cactaia.Bijoux',
        shopDescription: 'Bijoux écoresponsables et élégants',
        shopEmail: 'contact@cactaiabijoux.fr',
        shopPhone: '+33 1 23 45 67 89',
        shopAddress: '42 rue Maurice Violette, 28600 Luisant, France',
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleInputChange = (field: keyof ShopSettings, value: string) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleColorChange = (colorType: 'primary' | 'secondary', value: string) => {
        updateColors({ [colorType]: value });
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
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-medium">Apparence</h2>
                        </div>
                        <button
                            onClick={resetColors}
                            className="btn btn-outline text-xs px-3 py-1 flex items-center gap-1"
                            title="Réinitialiser les couleurs"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Couleur primaire
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={colors.primary}
                                    onChange={(e) => handleColorChange('primary', e.target.value)}
                                    className="w-16 h-12 border border-input rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={colors.primary}
                                    onChange={(e) => handleColorChange('primary', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                    placeholder="#4A7C59"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Cette couleur sera utilisée pour les boutons, liens et éléments d&apos;accent
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Couleur secondaire
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={colors.secondary}
                                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                                    className="w-16 h-12 border border-input rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={colors.secondary}
                                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                    placeholder="#F5F5F4"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Cette couleur sera utilisée pour les arrière-plans et éléments neutres
                            </p>
                        </div>

                        {/* Aperçu en temps réel */}
                        <div className="mt-6 p-4 border border-border rounded-lg">
                            <h3 className="text-sm font-medium mb-3">Aperçu en temps réel</h3>
                            <div className="space-y-2">
                                <button className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-600 transition-colors">
                                    Bouton primaire
                                </button>
                                <button className="w-full bg-secondary text-gray-900 py-2 px-4 rounded border border-border hover:bg-secondary-50 transition-colors">
                                    Bouton secondaire
                                </button>
                                <div className="flex gap-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                                        Badge
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-gray-700">
                                        Badge secondaire
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Sécurité et maintenance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
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
                                Activez le mode maintenance pour effectuer des mises à jour sans perturber l&apos;expérience utilisateur.
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
                                Dernière sauvegarde : Aujourd&apos;hui à 03:00
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
                                Actions irréversibles qui affectent l&apos;ensemble de la boutique.
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