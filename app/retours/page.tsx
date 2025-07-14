"use client";

import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function RetoursPage() {
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
                        <h1 className="text-3xl font-light text-gray-900 mb-2">Politique de retour</h1>
                        <p className="text-gray-600">
                            Vos achats en toute sérénité
                        </p>
                    </div>

                    {/* Contenu politique de retour */}
                    <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">1. Délai de rétractation</h2>
                            <p>Vous disposez d&apos;un délai de 14 jours après réception de votre commande pour exercer votre droit de rétractation.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">2. Procédure de retour</h2>
                            <p>Pour effectuer un retour, contactez notre service client et suivez les instructions fournies. Les articles doivent être retournés dans leur état d&apos;origine.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">3. Remboursement</h2>
                            <p>Le remboursement sera effectué après réception et vérification des articles retournés, dans un délai de 14 jours maximum.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">4. Exceptions</h2>
                            <p>Les articles personnalisés ou gravés ne sont pas éligibles au retour, sauf en cas de défaut.</p>
                        </div>
                    </div>

                    {/* Liens utiles */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="flex justify-center space-x-6 text-sm">
                            <Link href="/contact" className="text-gray-500 hover:text-primary transition-colors">
                                Contact
                            </Link>
                            <Link href="/boutique" className="text-gray-500 hover:text-primary transition-colors">
                                Découvrir nos bijoux
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Section droite - Image immersive */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
                <Image
                    src="/images/cactaïa-10.jpg"
                    alt="Bijoux Cactaia"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Overlay avec texte */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-center text-white p-8"
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <RefreshCw className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-light mb-4">Achetez en toute confiance</h2>
                        <p className="text-lg text-white/90 max-w-md">
                            Notre politique de retour vous garantit une expérience d&apos;achat sans risque
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
} 