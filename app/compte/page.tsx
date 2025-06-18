'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { motion } from 'framer-motion';
import { Heart, LogOut, Package, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AccountPage() {
  const { user, userProfile, signOut, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [switching, setSwitching] = useState(false);



  if (!user || !userProfile) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-lg mb-4">Accès non autorisé</h1>
          <Link href="/connexion" className="btn btn-primary">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const handleSwitchToAdmin = async () => {
    if (userProfile.role !== 'admin') return;

    setSwitching(true);
    try {
      await switchRole('admin');
      window.location.href = '/admin';
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
    } finally {
      setSwitching(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Mon profil', icon: User },
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
                  Bonjour, {userProfile.prenom || 'Utilisateur'}
                </h2>
                <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                    {userProfile.active_role === 'admin' ? 'Administrateur' : 'Client'}
                  </span>
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

                {userProfile.role === 'admin' && (
                  <button
                    onClick={handleSwitchToAdmin}
                    disabled={switching}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{switching ? 'Changement...' : 'Espace Admin'}</span>
                  </button>
                )}

                <button
                  onClick={signOut}
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
                  <h2 className="text-2xl font-medium mb-6">Mon profil</h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          defaultValue={userProfile.prenom}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          defaultValue={userProfile.nom}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={userProfile.email}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        defaultValue={userProfile.telephone || ''}
                        placeholder="Votre numéro de téléphone"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Adresse
                      </label>
                      <textarea
                        defaultValue={userProfile.adresse || ''}
                        placeholder="Votre adresse complète"
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary px-6 py-2"
                    >
                      Sauvegarder les modifications
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-medium mb-6">Mes commandes</h2>
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Vous n&apos;avez pas encore passé de commande.
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
                          <input type="checkbox" className="mr-3" defaultChecked />
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