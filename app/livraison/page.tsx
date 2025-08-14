"use client";

import HeroImage from '@/components/ui/hero-image';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LivraisonPage() {
    return (
        <div className="min-h-screen flex">
            {/* Section gauche - Contenu */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-32 h-12 relative mx-auto mb-6">
                            <Image
                                src="/CACTAIA LOGO_CACTAIA LOGO TERRA-07.png"
                                alt="Cactaia Bijoux Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-light text-gray-900 mb-2">Politique de livraison</h1>
                        <p className="text-gray-600">
                            Livraison rapide et sécurisée
                        </p>
                    </div>

                    {/* Contenu politique de livraison */}
                    <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">1. Délais de livraison</h2>
                            <p>Les commandes sont expédiées sous 2 à 5 jours ouvrés. Les délais de livraison varient selon la destination.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">2. Frais de livraison</h2>
                            <p>Les frais de livraison sont indiqués lors de la commande et varient selon le mode de livraison choisi.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">3. Suivi de commande</h2>
                            <p>Un numéro de suivi vous sera communiqué dès l&apos;expédition de votre commande.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">4. Problèmes de livraison</h2>
                            <p>En cas de retard ou de problème de livraison, contactez notre service client pour une assistance rapide.</p>
                        </div>
                    </div>

                    {/* Liens utiles */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="flex justify-center space-x-6 text-sm">
                            <Link href="/contact" className="text-gray-500 hover:text-primary transition-colors">
                                Contact
                            </Link>
                            <Link href="/collections" className="text-gray-500 hover:text-primary transition-colors">
                                Découvrir nos bijoux
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Section droite - Image immersive */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <HeroImage
                    src="/images/cactaïa-11.jpg"
                    alt="Bijoux Cactaia"
                    priority
                    zoomEffect={true}
                    zoomIntensity="medium"
                    overlayOpacity={0.2}
                    showGradient={true}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-center text-white p-8"
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Truck className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-light mb-4">Livraison rapide et sécurisée</h2>
                        <p className="text-lg text-white/90 max-w-md">
                            Vos bijoux vous parviennent en toute sécurité, partout en France
                        </p>
                    </motion.div>
                </HeroImage>
            </div>
        </div>
    );
} 