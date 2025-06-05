"use client"

import { motion } from 'framer-motion';
import { Heart, LogOut, Package, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');

  // This would normally come from your authentication system
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    joinDate: '2024-01-01'
  };

  const menuItems = [
    { id: 'profile', label: 'Mon profil', icon: User },
    { id: 'orders', label: 'Mes commandes', icon: Package },
    { id: 'wishlist', label: 'Ma liste de souhaits', icon: Heart },
  ];

  return (
    <div className="pt-24 pb-16">
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
                <h2 className="font-medium text-lg">Bonjour, {user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
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
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}