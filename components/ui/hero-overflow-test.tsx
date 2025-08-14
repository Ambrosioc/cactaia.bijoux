"use client";

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Image, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroOverflowTestProps {
    className?: string;
}

export default function HeroOverflowTest({ className }: HeroOverflowTestProps) {
    const [testResults, setTestResults] = useState({
        heroStable: false,
        noHorizontalScroll: false,
        imagesContained: false,
        topbarStable: false
    });
    const [testCount, setTestCount] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Simuler le changement d'images du slider
    const simulateImageChange = () => {
        setCurrentImageIndex(prev => (prev + 1) % 2);
        setTimeout(() => runHeroTest(), 100);
    };

    // Tester la stabilité de la section hero
    const runHeroTest = () => {
        setTestCount(prev => prev + 1);

        // Vérifier la section hero
        const heroSection = document.querySelector('.hero-carousel');
        const body = document.body;

        if (heroSection && body) {
            const heroRect = heroSection.getBoundingClientRect();
            const bodyRect = body.getBoundingClientRect();

            // Vérifier que la section hero est stable
            const heroStable = heroRect.width <= bodyRect.width &&
                heroRect.width === window.innerWidth;

            // Vérifier qu'il n'y a pas de scroll horizontal
            const noHorizontalScroll = body.scrollWidth === body.clientWidth;

            // Vérifier que les images sont contenues
            const images = heroSection.querySelectorAll('img');
            const imagesContained = Array.from(images).every(img => {
                const imgRect = img.getBoundingClientRect();
                return imgRect.width <= window.innerWidth &&
                    imgRect.left >= 0 &&
                    imgRect.right <= window.innerWidth;
            });

            // Vérifier que la topbar est stable
            const header = document.querySelector('header');
            let topbarStable = false;
            if (header) {
                const headerRect = header.getBoundingClientRect();
                topbarStable = headerRect.width <= window.innerWidth &&
                    headerRect.left >= 0 &&
                    headerRect.right <= window.innerWidth;
            }

            setTestResults({
                heroStable,
                noHorizontalScroll,
                imagesContained,
                topbarStable
            });
        }
    };

    // Test automatique
    useEffect(() => {
        const interval = setInterval(runHeroTest, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn('p-6 bg-white rounded-lg shadow-lg', className)}>
            <h3 className="text-lg font-semibold mb-4">Test de Stabilité de la Section Hero</h3>

            {/* Contrôles de test */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center space-x-4">
                    <Button
                        onClick={runHeroTest}
                        className="flex items-center space-x-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Lancer Test</span>
                    </Button>

                    <Button
                        onClick={simulateImageChange}
                        variant="outline"
                        className="flex items-center space-x-2"
                    >
                        <Image className="h-4 w-4" />
                        <span>Changer Image ({currentImageIndex + 1}/2)</span>
                    </Button>
                </div>

                <div className="text-sm text-gray-600">
                    Tests: {testCount} | Image actuelle: {currentImageIndex + 1}
                </div>
            </div>

            {/* Résultats des tests */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-800 mb-3">Résultats des Tests</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={cn(
                        'p-4 rounded-lg border-2',
                        testResults.heroStable
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                    )}>
                        <div className="flex items-center space-x-2">
                            {testResults.heroStable ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <span className={cn('font-medium', testResults.heroStable ? 'text-green-800' : 'text-red-800')}>
                                Section Hero Stable
                            </span>
                        </div>
                        <p className="text-sm mt-2 text-gray-600">
                            La section hero ne change pas de dimensions
                        </p>
                    </div>

                    <div className={cn(
                        'p-4 rounded-lg border-2',
                        testResults.noHorizontalScroll
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                    )}>
                        <div className="flex items-center space-x-2">
                            {testResults.noHorizontalScroll ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <span className={cn('font-medium', testResults.noHorizontalScroll ? 'text-green-800' : 'text-red-800')}>
                                Pas de Scroll Horizontal
                            </span>
                        </div>
                        <p className="text-sm mt-2 text-gray-600">
                            Aucun débordement horizontal sur la page
                        </p>
                    </div>

                    <div className={cn(
                        'p-4 rounded-lg border-2',
                        testResults.imagesContained
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                    )}>
                        <div className="flex items-center space-x-2">
                            {testResults.imagesContained ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <span className={cn('font-medium', testResults.imagesContained ? 'text-green-800' : 'text-red-800')}>
                                Images Contenues
                            </span>
                        </div>
                        <p className="text-sm mt-2 text-gray-600">
                            Toutes les images restent dans les limites de l'écran
                        </p>
                    </div>

                    <div className={cn(
                        'p-4 rounded-lg border-2',
                        testResults.topbarStable
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                    )}>
                        <div className="flex items-center space-x-2">
                            {testResults.topbarStable ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <span className={cn('font-medium', testResults.topbarStable ? 'text-green-800' : 'text-red-800')}>
                                Topbar Stable
                            </span>
                        </div>
                        <p className="text-sm mt-2 text-gray-600">
                            La topbar ne déborde jamais, même lors du changement d'images
                        </p>
                    </div>
                </div>
            </div>

            {/* Instructions de test */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h6 className="font-medium text-blue-800 mb-2">Instructions de Test</h6>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Utiliser "Changer Image" pour simuler le slider</li>
                    <li>• Observer que la topbar reste stable</li>
                    <li>• Vérifier qu'il n'y a pas de scroll horizontal</li>
                    <li>• Le test s'exécute automatiquement toutes les 2 secondes</li>
                    <li>• Tester sur différentes tailles d'écran</li>
                </ul>
            </div>

            {/* Corrections appliquées */}
            <div className="mt-4 bg-green-50 p-4 rounded-lg">
                <h6 className="font-medium text-green-800 mb-2">Corrections Appliquées</h6>
                <ul className="text-sm text-green-700 space-y-1">
                    <li>✅ Container fixe pour les images du slider</li>
                    <li>✅ Dimensions stables avec min/max width/height</li>
                    <li>✅ CSS avec !important pour forcer la stabilité</li>
                    <li>✅ Prévention du débordement horizontal global</li>
                    <li>✅ Classe hero-carousel pour les styles spécifiques</li>
                    <li>✅ Gestion du chargement des images</li>
                </ul>
            </div>

            {/* État actuel */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h6 className="font-medium text-gray-800 mb-2">État Actuel</h6>
                <div className="text-sm text-gray-700 space-y-1">
                    <p>• Section hero stable: {testResults.heroStable ? '✅' : '❌'}</p>
                    <p>• Pas de scroll horizontal: {testResults.noHorizontalScroll ? '✅' : '❌'}</p>
                    <p>• Images contenues: {testResults.imagesContained ? '✅' : '❌'}</p>
                    <p>• Topbar stable: {testResults.topbarStable ? '✅' : '❌'}</p>
                    <p>• Image actuelle: {currentImageIndex + 1}/2</p>
                    <p>• Tests effectués: {testCount}</p>
                </div>
            </div>

            {/* Avertissement */}
            {!testResults.topbarStable && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Attention</span>
                    </div>
                    <p className="text-sm mt-2 text-yellow-700">
                        La topbar déborde encore lors du changement d'images. Vérifiez que toutes les corrections sont appliquées.
                    </p>
                </div>
            )}
        </div>
    );
}
