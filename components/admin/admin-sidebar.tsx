'use client';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Box,
    CreditCard,
    Folder,
    Image,
    LogOut,
    Package,
    Palette,
    Receipt,
    Settings,
    ShoppingCart,
    Users,
    Warehouse
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface SidebarLinkProps {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isActive?: boolean;
    badge?: string;
    disabled?: boolean;
}

function SidebarLink({ href, icon: Icon, label, isActive, badge, disabled }: SidebarLinkProps) {
    const content = (
        <div className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors",
            isActive
                ? "bg-primary text-white"
                : disabled
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : "text-foreground hover:bg-secondary hover:text-foreground"
        )}>
            <div className="flex items-center space-x-3">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{label}</span>
            </div>
            {badge && (
                <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                )}>
                    {badge}
                </span>
            )}
        </div>
    );

    if (disabled) {
        return <div className="cursor-not-allowed">{content}</div>;
    }

    return (
        <Link href={href} className="block">
            {content}
        </Link>
    );
}

interface SidebarSectionProps {
    title: string;
    children: React.ReactNode;
}

function SidebarSection({ title, children }: SidebarSectionProps) {
    return (
        <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {title}
            </h3>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const isActive = (path: string) => {
        if (path === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(path);
    };

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        try {
            await supabase.auth.signOut();
            router.push('/connexion');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-64 bg-white border-r border-border fixed left-0 top-20 flex flex-col admin-sidebar"
            style={{ height: 'calc(100vh - 5rem)' }}
        >
            {/* Header */}
            <div className="p-6 border-b border-border">
                <Link href="/admin" className="block">
                    <h2 className="font-playfair text-xl font-medium">
                        Admin<span className="text-primary">.</span>Panel
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Gestion du site
                    </p>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
                {/* Dashboard */}
                <SidebarSection title="Tableau de bord">
                    <SidebarLink
                        href="/admin"
                        icon={BarChart3}
                        label="Dashboard"
                        isActive={isActive('/admin') && pathname === '/admin'}
                    />
                    <SidebarLink
                        href="/admin/analytics"
                        icon={BarChart3}
                        label="Analytics"
                        isActive={isActive('/admin/analytics')}
                    />
                    <SidebarLink
                        href="/admin/stocks"
                        icon={Package}
                        label="Stocks"
                        isActive={isActive('/admin/stocks')}
                    />
                </SidebarSection>

                {/* Gestion des produits */}
                <SidebarSection title="Produits">
                    <SidebarLink
                        href="/admin/produits"
                        icon={Package}
                        label="Produits"
                        isActive={isActive('/admin/produits')}
                    />
                    <SidebarLink
                        href="/admin/categories"
                        icon={Folder}
                        label="Catégories"
                        isActive={isActive('/admin/categories')}
                    />
                    <SidebarLink
                        href="/admin/variations"
                        icon={Palette}
                        label="Variations"
                        isActive={isActive('/admin/variations')}
                    />
                    <SidebarLink
                        href="/admin/collections"
                        icon={Folder}
                        label="Collections"
                        isActive={isActive('/admin/collections')}
                    />
                    <SidebarLink
                        href="/admin/stocks"
                        icon={Warehouse}
                        label="Stock"
                        isActive={isActive('/admin/stocks')}
                    />
                    <SidebarLink
                        href="/admin/sku"
                        icon={Box}
                        label="SKU"
                        isActive={isActive('/admin/sku')}
                    />
                    <SidebarLink
                        href="/admin/medias"
                        icon={Image}
                        label="Médias"
                        isActive={isActive('/admin/medias')}
                    />
                </SidebarSection>

                {/* Commandes */}
                <SidebarSection title="Commandes">
                    <SidebarLink
                        href="/admin/commandes"
                        icon={ShoppingCart}
                        label="Commandes"
                        isActive={isActive('/admin/commandes')}
                    />
                </SidebarSection>

                {/* Paiement & Livraison */}
                <SidebarSection title="Paiement & Livraison">
                    <SidebarLink
                        href="/admin/stripe"
                        icon={CreditCard}
                        label="Stripe"
                        isActive={isActive('/admin/stripe')}
                    />
                    <SidebarLink
                        href="/admin/paiements"
                        icon={Receipt}
                        label="Paiements"
                        isActive={isActive('/admin/paiements')}
                    />
                </SidebarSection>

                {/* Utilisateurs / Clients */}
                <SidebarSection title="Clients">
                    <SidebarLink
                        href="/admin/utilisateurs"
                        icon={Users}
                        label="Utilisateurs"
                        isActive={isActive('/admin/utilisateurs')}
                    />
                </SidebarSection>
            </div>

            {/* Paramètres et Déconnexion - Fixés en bas */}
            <div className="p-4 border-t border-border space-y-2">
                <SidebarLink
                    href="/admin/parametres"
                    icon={Settings}
                    label="Paramètres"
                    isActive={isActive('/admin/parametres')}
                />

                {/* Bouton de déconnexion */}
                <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors",
                        "text-red-600 hover:bg-red-50 hover:text-red-700",
                        isLoggingOut && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <div className="flex items-center space-x-3">
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                            {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                        </span>
                    </div>
                </button>
            </div>
        </motion.div>
    );
}