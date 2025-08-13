"use client";

import { cn } from '@/lib/utils';
import { useState } from 'react';
import HeroImage from './hero-image';

interface HeroZoomDemoProps {
    className?: string;
}

export default function HeroZoomDemo({ className }: HeroZoomDemoProps) {
    const [activeIntensity, setActiveIntensity] = useState<'subtle' | 'medium' | 'strong'>('medium');
    const [showGradient, setShowGradient] = useState(true);
    const [overlayOpacity, setOverlayOpacity] = useState(0.2);

    const demoImages = [
        {
            src: '/images/cactaïa-19.jpg',
            alt: 'Cactaïa Collection Nature',
            title: 'Effet de dézoom',
            subtitle: 'Testez les différents niveaux d\'intensité'
        },
        {
            src: '/images/cactaïa-23.jpg',
            alt: 'Cactaïa Notre Atelier',
            title: 'Images hero optimisées',
            subtitle: 'Avec gestion responsive et effets visuels'
        }
    ];

    return (
        <div className={cn('p-6 bg-white rounded-lg shadow-lg', className)}>
            <h3 className="text-lg font-semibold mb-4">Démonstration Effets de Dézoom Hero</h3>

            {/* Contrôles */}
            <div className="mb-6 space-y-4">
                <div>
                    <h4 className="font-medium text-gray-800 mb-2">Intensité du zoom</h4>
                    <div className="flex space-x-2">
                        {(['subtle', 'medium', 'strong'] as const).map((intensity) => (
                            <button
                                key={intensity}
                                onClick={() => setActiveIntensity(intensity)}
                                className={cn(
                                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                    activeIntensity === intensity
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                )}
                            >
                                {intensity === 'subtle' && 'Subtile'}
                                {intensity === 'medium' && 'Moyenne'}
                                {intensity === 'strong' && 'Forte'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={showGradient}
                                onChange={(e) => setShowGradient(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700">Afficher le gradient</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-1">
                            Opacité overlay: {overlayOpacity}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="0.8"
                            step="0.1"
                            value={overlayOpacity}
                            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Démonstration */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {demoImages.map((image, index) => (
                        <div key={index} className="space-y-3">
                            <h5 className="font-medium text-gray-800">{image.title}</h5>
                            <p className="text-sm text-gray-600">{image.subtitle}</p>

                            <div className="relative h-64 rounded-lg overflow-hidden">
                                <HeroImage
                                    src={image.src}
                                    alt={image.alt}
                                    zoomEffect={true}
                                    zoomIntensity={activeIntensity}
                                    overlayOpacity={overlayOpacity}
                                    showGradient={showGradient}
                                    className="rounded-lg"
                                >
                                    <div className="text-center text-white p-4">
                                        <h6 className="font-medium mb-2">Intensité: {activeIntensity}</h6>
                                        <p className="text-sm opacity-90">
                                            {activeIntensity === 'subtle' && 'Zoom subtil (5%)'}
                                            {activeIntensity === 'medium' && 'Zoom moyen (10%)'}
                                            {activeIntensity === 'strong' && 'Zoom fort (25%)'}
                                        </p>
                                    </div>
                                </HeroImage>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Informations techniques */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h6 className="font-medium text-gray-800 mb-2">Caractéristiques des effets de dézoom</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• <strong>Subtile (5%)</strong>: Effet doux, idéal pour les images délicates</li>
                        <li>• <strong>Moyenne (10%)</strong>: Équilibre parfait entre impact et subtilité</li>
                        <li>• <strong>Forte (25%)</strong>: Effet dramatique pour les images impactantes</li>
                        <li>• <strong>Transition fluide</strong>: Durée de 3 secondes avec easing naturel</li>
                        <li>• <strong>Responsive</strong>: Désactivé sur mobile pour les performances</li>
                        <li>• <strong>Personnalisable</strong>: Gradient et overlay ajustables</li>
                    </ul>
                </div>

                {/* Code d'utilisation */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h6 className="font-medium text-blue-800 mb-2">Code d&apos;utilisation</h6>
                    <pre className="text-xs text-blue-700 bg-blue-100 p-3 rounded overflow-x-auto">
                        {`<HeroImage
  src="/images/hero.jpg"
  alt="Description"
  zoomEffect={true}
  zoomIntensity="medium"
  overlayOpacity={0.2}
  showGradient={true}
>
  {/* Contenu enfant */}
</HeroImage>`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
