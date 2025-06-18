'use client';

import { motion } from 'framer-motion';
import { Heart, LogOut, Package, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/stores/userStore';
import { RoleSwitcher } from '@/components/ui/role-switcher';
import { createClient } from '@/lib/supabase/client';

export default function AccountPage() {
  const { 
    user, 
    isAuthenticated, 
    isActiveUser, 
    displayName, 
    loading: userLoading 
  } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAccess = async () => {
      if (userLoading) return; // Attendre que le store soit initialisé

      if (!isAuthenticated) {
        router.push('/connexion');
        return;
      }

      if (!user) {
        return; // Attendre que le profil soit chargé
      }

      // Vérifier que l'utilisateur est en mode user
      if (!isActiveUser) {
        router.push('/admin');
        return;
      }

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

  // Double vérification côté client
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
                  <h2 className="text-2xl font-medium mb-6">Mon profil</h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          defaultValue={user.prenom}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          defaultValue={user.nom}
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
                        defaultValue={user.email}
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
                        defaultValue={user.telephone || ''}
                        placeholder="Votre numéro de téléphone"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Adresse
                      </label>
                      <textarea
                        defaultValue={user.adresse || ''}
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