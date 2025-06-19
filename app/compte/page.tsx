'use client';

import { OrdersList } from '@/components/orders-list';
import { RoleSwitcher } from '@/components/ui/role-switcher';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { Edit3, Heart, LogOut, MapPin, Package, Save, Settings, User, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EditableFields {
  email: string;
  telephone: string;
  adresse: string;
}

export default function AccountPage() {
  const {
    user,
    isAuthenticated,
    isActiveUser,
    displayName,
    loading: userLoading,
    updateProfile,
    refreshUser
  } = useUser();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<EditableFields>({
    email: '',
    telephone: '',
    adresse: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

      // Initialiser les données éditables
      setEditableData({
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || ''
      });

      setLoading(false);
    };

    checkAccess();
  }, [isAuthenticated, user, isActiveUser, userLoading, router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Annuler les modifications
      setEditableData({
        email: user?.email || '',
        telephone: user?.telephone || '',
        adresse: user?.adresse || ''
      });
      setMessage(null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: keyof EditableFields, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      // Vérifier si l'email a changé
      const emailChanged = editableData.email !== user.email;

      // Mettre à jour le profil dans la table users
      await updateProfile({
        email: editableData.email,
        telephone: editableData.telephone || undefined,
        adresse: editableData.adresse || undefined
      });

      // Si l'email a changé, le mettre à jour aussi dans auth.users
      if (emailChanged) {
        const { error: authError } = await supabase.auth.updateUser({
          email: editableData.email
        });

        if (authError) {
          throw new Error(`Erreur lors de la mise à jour de l'email: ${authError.message}`);
        }
      }

      // Rafraîchir les données utilisateur
      await refreshUser();

      setIsEditing(false);
      setMessage({
        type: 'success',
        text: emailChanged
          ? 'Profil mis à jour avec succès. Un email de confirmation a été envoyé à votre nouvelle adresse.'
          : 'Profil mis à jour avec succès.'
      });

      // Effacer le message après 5 secondes
      setTimeout(() => setMessage(null), 5000);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde des modifications'
      });
    } finally {
      setSaving(false);
    }
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

  const menuItems = [
    { id: 'profile', label: 'Mon profil', icon: User },
    { id: 'addresses', label: 'Mes adresses', icon: MapPin },
    { id: 'orders', label: 'Mes commandes', icon: Package },
    { id: 'wishlist', label: 'Ma liste de souhaits', icon: Heart },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-primary/5 to-secondary">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-6">
                <h2 className="font-medium text-lg">
                  Bonjour, {displayName}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-3">
                  <RoleSwitcher variant="badge" />
                </div>
              </div>

              <nav className="space-y-2">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === item.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-secondary'
                      }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-2 px-4 py-2 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3"
          >
            <div className="bg-white p-8 rounded-lg shadow-sm">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-medium">Mon profil</h2>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleEditToggle}
                            className="btn btn-outline flex items-center gap-2 px-4 py-2"
                            disabled={saving}
                          >
                            <X className="h-4 w-4" />
                            Annuler
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary flex items-center gap-2 px-4 py-2"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            {saving ? 'Sauvegarde...' : 'Enregistrer'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEditToggle}
                          className="btn btn-primary flex items-center gap-2 px-4 py-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Modifier mes informations
                        </button>
                      )}
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

                  <form className="space-y-6">
                    {/* Informations en lecture seule */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={user.prenom}
                          disabled
                          className="w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Non modifiable
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={user.nom}
                          disabled
                          className="w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Non modifiable
                        </p>
                      </div>
                    </div>

                    {user.genre && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Genre
                        </label>
                        <input
                          type="text"
                          value={user.genre}
                          disabled
                          className="w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Non modifiable
                        </p>
                      </div>
                    )}

                    {user.date_naissance && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Date de naissance
                        </label>
                        <input
                          type="text"
                          value={new Date(user.date_naissance).toLocaleDateString('fr-FR')}
                          disabled
                          className="w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Non modifiable
                        </p>
                      </div>
                    )}

                    {/* Champs éditables */}
                    <div className="border-t border-border pt-6">
                      <h3 className="text-lg font-medium mb-4">Informations modifiables</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={editableData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full rounded-md border px-3 py-2 transition-colors ${isEditing
                              ? 'border-input bg-background focus:ring-2 focus:ring-primary'
                              : 'border-input bg-gray-50 text-gray-500 cursor-not-allowed'
                              }`}
                            required
                          />
                          {isEditing && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Un email de confirmation sera envoyé si vous modifiez cette adresse
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={editableData.telephone}
                            onChange={(e) => handleInputChange('telephone', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Votre numéro de téléphone"
                            className={`w-full rounded-md border px-3 py-2 transition-colors ${isEditing
                              ? 'border-input bg-background focus:ring-2 focus:ring-primary'
                              : 'border-input bg-gray-50 text-gray-500 cursor-not-allowed'
                              }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Adresse
                          </label>
                          <textarea
                            value={editableData.adresse}
                            onChange={(e) => handleInputChange('adresse', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Votre adresse complète"
                            rows={3}
                            className={`w-full rounded-md border px-3 py-2 transition-colors resize-none ${isEditing
                              ? 'border-input bg-background focus:ring-2 focus:ring-primary'
                              : 'border-input bg-gray-50 text-gray-500 cursor-not-allowed'
                              }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Informations du compte */}
                    <div className="border-t border-border pt-6">
                      <h3 className="text-lg font-medium mb-4">Informations du compte</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Rôle
                          </label>
                          <input
                            type="text"
                            value={user.role === 'admin' ? 'Administrateur' : 'Client'}
                            disabled
                            className="w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Membre depuis
                          </label>
                          <input
                            type="text"
                            value={new Date(user.created_at).toLocaleDateString('fr-FR')}
                            disabled
                            className="w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-medium">Mes adresses</h2>
                    <Link
                      href="/compte/mes-adresses"
                      className="btn btn-primary flex items-center gap-2 px-4 py-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Gérer mes adresses
                    </Link>
                  </div>
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Gérez vos adresses de livraison pour faciliter vos commandes.
                    </p>
                    <Link
                      href="/compte/mes-adresses"
                      className="btn btn-primary px-6 py-2"
                    >
                      Ajouter une adresse
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-medium mb-6">Mes commandes</h2>
                  <OrdersList />
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-medium mb-6">Ma liste de souhaits</h2>
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Votre liste de souhaits est vide.
                    </p>
                    <Link
                      href="/boutique"
                      className="btn btn-primary mt-4 px-6 py-2"
                    >
                      Découvrir nos produits
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-medium mb-6">Paramètres</h2>
                  <div className="space-y-6">
                    <div className="border border-border rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-4">Sécurité</h3>
                      <button className="btn btn-outline">
                        Changer le mot de passe
                      </button>
                    </div>
                    <div className="border border-border rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-3"
                            defaultChecked={user.newsletter}
                          />
                          Recevoir les newsletters
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          Notifications de commande
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}