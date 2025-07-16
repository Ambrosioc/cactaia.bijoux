"use client"

import { createClient } from '@/lib/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CategorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const CategorySidebar = ({ isOpen, onClose }: CategorySidebarProps) => {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('produits')
                .select('categorie')
                .eq('est_actif', true);

            if (error) throw error;

            const uniqueCategories = [...new Set(data?.map(item => item.categorie) || [])];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category: string) => {
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.div
                        className="fixed left-0 top-0 h-full w-96 bg-white z-50 shadow-xl mt-20"
                        initial={{ x: -384 }}
                        animate={{ x: 0 }}
                        exit={{ x: -384 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Catégories</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Categories List */}
                        <div className="p-6">
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <Link
                                            key={category}
                                            href={`/categorie/${category.toLowerCase().replace(/\s+/g, '-')}`}
                                            onClick={() => handleCategoryClick(category)}
                                            className="block p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">
                                                    {category}
                                                </span>
                                                <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-gray-50">
                            <p className="text-sm text-gray-600 text-center">
                                Découvrez nos collections par catégorie
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CategorySidebar; 