"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Maximize2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroWidthTestProps {
    className?: string;
}

export default function HeroWidthTest({ className }: HeroWidthTestProps) {
    const [testResults, setTestResults] = useState({
        fullWidth: false,
        fullHeight: false,
        noOverflow: false,
        properPositioning: false
    });
    const [testCount, setTestCount] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Simuler le changement d'images du slider
    const simulateImageChange = () => {
        setCurrentImageIndex(prev => (prev + 1) % 2);
        setTimeout(() => runWidthTest(), 100);
    };

    // Tester la largeur des images du hero
    const runWidthTest = () => {
        setTestCount(prev => prev + 1);
        
        // Vérifier la section hero
        const heroSection = document.querySelector('.hero-carousel');
        const heroContainer = document.querySelector('.hero-container');
        const heroImageContainers = document.querySelectorAll('.hero-image-container');
        const optimizedImageContainers = document.querySelectorAll('.optimized-image-container');
        const images = document.querySelectorAll('.hero-carousel img');
        
        if (heroSection && heroContainer && images.length > 0) {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Vérifier que les images prennent toute la largeur
            const fullWidth = Array.from(images).every(img => {
                const imgRect = img.getBoundingClientRect();
                return Math.abs(imgRect.width - viewportWidth) < 5; // Tolérance de 5px
            });
            
            // Vérifier que les images prennent toute la hauteur
            const fullHeight = Array.from(images).every(img => {
                const imgRect = img.getBoundingClientRect();
                return Math.abs(imgRect.height - viewportHeight) < 5; // Tolérance de 5px
            });
            
            // Vérifier qu'il n'y a pas de débordement
            const noOverflow = Array.from(images).every(img => {
                const imgRect = img.getBoundingClientRect();
                return imgRect.left >= 0 && 
                       imgRect.right <= viewportWidth &&
                       imgRect.top >= 0 && 
                       imgRect.bottom <= viewportHeight;
            });
            
            // Vérifier le positionnement correct
            const properPositioning = Array.from(images).every(img => {
                const imgRect = img.getBoundingClientRect();
                return imgRect.left === 0 && imgRect.top === 0;
            });
            
            setTestResults({
                fullWidth,
                fullHeight,
                noOverflow,
                properPositioning
            });
        }
    };

    // Test automatique
    useEffect(() => {
        const interval = setInterval(runWidthTest, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn('p-6 bg-white rounded-lg shadow-lg', className)}>
            <h3 className="text-lg font-semibold mb-4">Test de Largeur des Images Hero</h3>
            
            {/* Contrôles de test */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center space-x-4">
                    <Button
                        onClick={runWidthTest}
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
                        <Maximize2 className="h-4 w-4" />
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
                        testResults.fullWidth 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                    )}>
                        <div className="flex items-center space-x-2">
                            {testResults.fullWidth ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <span className={cn('font-medium', testResults.fullWidth ? 'text-green-800' : 'text-red-800')}>
                                Largeur Complète
                            </span>
                        </div>
                        <p className="text-sm mt-2 text-gray-600">
                            Les images prennent toute la largeur de l'écran
                        </p>
                    </div>

                    <div className={cn(
                        'p-4 rounded-lg border-2',
                        testResults.fullHeight 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                    )}>
                        <div className="flex items-center space-x-2">
                            {testResults.fullHeight ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <span className={cn('font-medium', testResults.fullHeight ? 'text-green-800' : 'text-red-800')}>
                                Hauteur Complète
                            </span>
                        </div>
                        <p className="text-sm mt-2 text-gray-600">
                            Les images prennent toute la hauteur de l'écran
                        </p>
                    </div>

                    <div className={cn(
                        'p-4 rounded-lg border-2',
                        testResults.noOverflow 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                    )}>
                        <div className="flex items-center space-x-2">
                            {testResults.noOverflow ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <span className={cn('font-medium', testResults.noOverflow ? 'text-green-800' : 'text-red-800')}>
                                Pas de Débordement
                            </span>
                        </div>
                        <p className="text-sm mt-2 text-gray-600">
                            Les images ne débordent pas de l'écran
                        </p>
                    </div>

                    <div className={cn(
                        'p-4 rounded-lg border-2',
                        testResults.properPositioning 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                    )}>
                        <div className="flex items-center space-x-2">
                            {testResults.properPositioning ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <span className={cn('font-medium', testResults.properPositioning ? 'text-green-800' : 'text-red-800')}>
                                Positionnement Correct
                            </span>
                        </div>
                        <p className="text-sm mt-2 text-gray-600">
                            Les images sont bien positionnées (0,0)
                        </p>
                    </div>
                </div>
            </div>

            {/* Instructions de test */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h6 className="font-medium text-blue-800 mb-2">Instructions de Test</h6>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Utiliser "Changer Image" pour simuler le slider</li>
                    <li>• Observer que les images prennent toute la largeur</li>
                    <li>• Vérifier qu'il n'y a pas de débordement</li>
                    <li>• Le test s'exécute automatiquement toutes les 2 secondes</li>
                    <li>• Tester sur différentes tailles d'écran</li>
                </ul>
            </div>

            {/* Corrections appliquées */}
            <div className="mt-4 bg-green-50 p-4 rounded-lg">
                <h6 className="font-medium text-green-800 mb-2">Corrections Appliquées</h6>
                <ul className="text-sm text-green-700 space-y-1">
                    <li>✅ CSS avec 100vw/100vh pour forcer la pleine largeur/hauteur</li>
                    <li>✅ Classes CSS spécifiques (.hero-container, .hero-image-container)</li>
                    <li>✅ Styles !important pour surcharger les styles par défaut</li>
                    <li>✅ Positionnement absolu avec top:0, left:0</li>
                    <li>✅ Container optimisé pour OptimizedImage</li>
                    <li>✅ Box-sizing border-box pour tous les éléments</li>
                </ul>
            </div>

            {/* État actuel */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h6 className="font-medium text-gray-800 mb-2">État Actuel</h6>
                <div className="text-sm text-gray-700 space-y-1">
                    <p>• Largeur complète: {testResults.fullWidth ? '✅' : '❌'}</p>
                    <p>• Hauteur complète: {testResults.fullHeight ? '✅' : '❌'}</p>
                    <p>• Pas de débordement: {testResults.noOverflow ? '✅' : '❌'}</p>
                    <p>• Positionnement correct: {testResults.properPositioning ? '✅' : '❌'}</p>
                    <p>• Image actuelle: {currentImageIndex + 1}/2</p>
                    <p>• Tests effectués: {testCount}</p>
                </div>
            </div>

            {/* Avertissement */}
            {!testResults.fullWidth && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Attention</span>
                    </div>
                    <p className="text-sm mt-2 text-yellow-700">
                        Les images ne prennent pas encore toute la largeur. Vérifiez que tous les styles CSS sont appliqués.
                    </p>
                </div>
            )}
        </div>
    );
}
