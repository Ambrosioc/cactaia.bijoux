'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminDashboard() {
  const { userProfile, switchRole } = useAuth();
  const [switching, setSwitching] = useState(false);

  if (!userProfile || userProfile.role !== 'admin' || userProfile.active_role !== 'admin') {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-lg mb-4">Accès non autorisé</h1>
          <Link href="/connexion" className="btn btn-primary">
            Retour au compte
          </Link>
        </div>
      </div>
    );
  }

  const handleSwitchToUser = async () => {
    setSwitching(true);
    try {
      await switchRole('user');
      window.location.href = '/compte';
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
    } finally {
      setSwitching(false);
    }
  };

  const stats = [
    {
      title: 'Utilisateurs',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Produits',
      value: '89',
      change: '+3%',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Commandes',
      value: '456',
      change: '+8%',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Revenus',
      value: '€12,345',
      change: '+15%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="heading-lg">Dashboard Administrateur</h1>
            <p className="text-muted-foreground">
              Bienvenue, {userProfile.prenom} {userProfile.nom}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSwitchToUser}
              disabled={switching}
              className="btn btn-outline flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {switching ? 'Changement...' : 'Espace Client'}
            </button>
            <Link href="/admin/settings" className="btn btn-primary flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-medium mb-4">Gestion des produits</h3>
            <p className="text-muted-foreground mb-4">
              Ajoutez, modifiez ou supprimez des produits de votre catalogue.
            </p>
            <Link href="/admin/products" className="btn btn-primary w-full">
              Gérer les produits
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-medium mb-4">Gestion des commandes</h3>
            <p className="text-muted-foreground mb-4">
              Suivez et gérez toutes les commandes de vos clients.
            </p>
            <Link href="/admin/orders" className="btn btn-primary w-full">
              Voir les commandes
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-medium mb-4">Gestion des utilisateurs</h3>
            <p className="text-muted-foreground mb-4">
              Administrez les comptes utilisateurs et leurs permissions.
            </p>
            <Link href="/admin/users" className="btn btn-primary w-full">
              Gérer les utilisateurs
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}