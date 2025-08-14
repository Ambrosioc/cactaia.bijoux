"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getResponsiveImageSizes, getOptimalQuality } from '@/lib/config/image-optimization';
import OptimizedImage from './optimized-image';
import ProductImage from './product-image';

interface ResponsiveImageDemoProps {
    className?: string;
}

export default function ResponsiveImageDemo({ className }: ResponsiveImageDemoProps) {
    const [activeTab, setActiveTab] = useState<'optimized' | 'product' | 'comparison'>('optimized');
    const [isMobile, setIsMobile] = useState(false);

    // Détecter si on est sur mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 640);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const demoImages = [
        {
            src: '/images/cactaïa-01.jpg',
            alt: 'Cactaïa Collection 1',
            context: 'product' as const,
            variant: 'main' as const,
        },
        {
            src: '/images/cactaïa-02.jpg',
            alt: 'Cactaïa Collection 2',
            context: 'product' as const,
            variant: 'gallery' as const,
        },
        {
            src: '/images/cactaïa-03.jpg',
            alt: 'Cactaïa Collection 3',
            context: 'grid' as const,
            variant: 'medium' as const,
        },
    ];

    return (
        <div className={cn('p-6 bg-white rounded-lg shadow-lg', className)}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Démonstration Responsive Images</h3>
                <div className={cn(
                    'px-2 py-1 text-xs rounded-full font-medium',
                    isMobile ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                )}>
                    {isMobile ? '📱 Mobile' : '💻 Desktop/Tablette'}
                </div>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
                <button
                    onClick={() => setActiveTab('optimized')}
                    className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        activeTab === 'optimized'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                >
                    OptimizedImage
                </button>
                <button
                    onClick={() => setActiveTab('product')}
                    className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        activeTab === 'product'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                >
                    ProductImage
                </button>
                <button
                    onClick={() => setActiveTab('comparison')}
                    className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        activeTab === 'comparison'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                >
                    Comparaison
                </button>
            </div>

            {/* Contenu des tabs */}
            {activeTab === 'optimized' && (
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Composant OptimizedImage</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        Utilise la configuration responsive automatique avec détection mobile.
                        {isMobile && (
                            <span className="text-green-600 font-medium"> Détecté en mode mobile - Qualité optimisée à 95%</span>
                        )}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {demoImages.map((image, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                <OptimizedImage
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    context={image.context}
                                    variant={image.variant}
                                    responsive={true}
                                    className="rounded-lg"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'product' && (
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Composant ProductImage</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        Spécialisé pour les produits avec badges et gestion d'erreur.
                        {isMobile && (
                            <span className="text-green-600 font-medium"> Mode mobile activé - Tailles optimisées</span>
                        )}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {demoImages.map((image, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                <ProductImage
                                    src={image.src}
                                    alt={image.alt}
                                    variant={image.variant as 'main' | 'gallery'}
                                    showBadge={index === 0}
                                    badgeText={index === 0 ? "Nouveau" : undefined}
                                    badgeColor={index === 0 ? "success" : "primary"}
                                    className="rounded-lg"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'comparison' && (
                <div className="space-y-6">
                    <h4 className="font-medium text-gray-900">Comparaison des Composants</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* OptimizedImage */}
                        <div className="space-y-3">
                            <h5 className="font-medium text-gray-800">OptimizedImage</h5>
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <OptimizedImage
                                    src="/images/cactaïa-01.jpg"
                                    alt="Démonstration OptimizedImage"
                                    fill
                                    context="product"
                                    variant="main"
                                    responsive={true}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                                <p>✅ Détection automatique mobile</p>
                                <p>✅ Tailles responsive automatiques</p>
                                <p>✅ Qualité optimisée par breakpoint</p>
                                <p>✅ Gestion des formats modernes</p>
                            </div>
                        </div>

                        {/* ProductImage */}
                        <div className="space-y-3">
                            <h5 className="font-medium text-gray-800">ProductImage</h5>
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <ProductImage
                                    src="/images/cactaïa-02.jpg"
                                    alt="Démonstration ProductImage"
                                    variant="main"
                                    showBadge={true}
                                    badgeText="Populaire"
                                    badgeColor="primary"
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                                <p>✅ Spécialisé produits</p>
                                <p>✅ Badges intégrés</p>
                                <p>✅ Gestion d'erreur avancée</p>
                                <p>✅ Optimisations mobile spécifiques</p>
                            </div>
                        </div>
                    </div>

                    {/* Informations techniques */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h6 className="font-medium text-gray-800 mb-2">Améliorations Responsive</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Breakpoint mobile optimisé: 640px (au lieu de 768px)</li>
                            <li>• Qualité mobile: 95% (au lieu de 85%)</li>
                            <li>• Qualité tablette: 90%</li>
                            <li>• Qualité desktop: 85%</li>
                            <li>• Tailles d&apos;images optimisées pour éviter la compression</li>
                            <li>• Formats WebP et AVIF prioritaires</li>
                            <li>• Détection automatique du contexte d&apos;utilisation</li>
                        </ul>
                    </div>

                    {/* État actuel */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h6 className="font-medium text-blue-800 mb-2">État Actuel</h6>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>• Breakpoint détecté: {isMobile ? 'Mobile (≤640px)' : 'Desktop/Tablette (>640px)'}</p>
                            <p>• Qualité optimale: {isMobile ? '95%' : '85-90%'}</p>
                            <p>• Tailles d&apos;images: {isMobile ? '100vw (pleine largeur)' : 'Responsive'}</p>
                            <p>• Formats: WebP et AVIF prioritaires</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
