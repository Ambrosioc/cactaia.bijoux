'use client';

import { useUser } from '@/stores/userStore';
import {
    Package,
    Plus,
    Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StockManagementClient() {
    const { isActiveAdmin } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    if (!isActiveAdmin) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-medium mb-4">Accès non autorisé</h1>
                <p className="text-muted-foreground">
                    Vous devez être administrateur pour accéder à cette page.
                </p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-medium mb-2">Gestion des Stocks</h1>
                    <p className="text-muted-foreground">
                        Gérez vos stocks et surveillez vos alertes
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter du stock
                    </button>
                    <button className="btn btn-outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Paramètres
                    </button>
                </div>
            </div>

            {/* Contenu temporaire */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Gestion des stocks</h3>
                    <p className="text-muted-foreground">
                        Cette fonctionnalité sera bientôt disponible.
                    </p>
                </div>
            </div>
        </div>
    );
} 