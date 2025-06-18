'use client';

import ProductForm from '@/components/admin/product-form';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/supabase/types';
import { useUser } from '@/stores/userStore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditProductPage() {
    const { id } = useParams();
    const { isActiveAdmin } = useUser();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (!isActiveAdmin) {
            router.push('/compte');
            return;
        }

        const loadProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('produits')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    throw error;
                }

                setProduct(data);
            } catch (error) {
                console.error('Erreur lors du chargement du produit:', error);
                setError('Produit non trouvé');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProduct();
        }
    }, [id, isActiveAdmin, router]);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement du produit...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-medium mb-4">Produit non trouvé</h1>
                    <p className="text-muted-foreground mb-6">
                        Le produit que vous recherchez n'existe pas ou a été supprimé.
                    </p>
                    <button
                        onClick={() => router.push('/admin/produits')}
                        className="btn btn-primary"
                    >
                        Retour aux produits
                    </button>
                </div>
            </div>
        );
    }

    return <ProductForm product={product} isEditing={true} />;
}