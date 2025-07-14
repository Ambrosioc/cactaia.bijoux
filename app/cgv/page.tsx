"use client";

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CGVPage() {
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
                        <h1 className="text-3xl font-light text-gray-900 mb-2">Conditions Générales de Vente</h1>
                        <p className="text-gray-600">
                            Dernière mise à jour : Juillet 2024
                        </p>
                    </div>

                    {/* Contenu CGV */}
                    <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">1. Objet</h2>
                            <p>Les présentes conditions générales de vente (CGV) régissent les ventes de bijoux réalisées sur le site Cactaia.Bijoux.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">2. Commande</h2>
                            <p>Toute commande passée sur le site implique l'acceptation pleine et entière des présentes CGV.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">3. Prix</h2>
                            <p>Les prix sont indiqués en euros, toutes taxes comprises. Cactaia.Bijoux se réserve le droit de modifier ses prix à tout moment.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">4. Paiement</h2>
                            <p>Le paiement s'effectue en ligne par carte bancaire ou tout autre moyen proposé sur le site.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">5. Livraison</h2>
                            <p>Les délais de livraison sont indiqués lors de la commande. Voir la <Link href="/livraison" className="text-primary hover:underline">Politique de livraison</Link>.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">6. Droit de rétractation</h2>
                            <p>Voir la <Link href="/retours" className="text-primary hover:underline">Politique de retour</Link> pour les modalités de retour et de remboursement.</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-3">7. Service client</h2>
                            <p>Pour toute question, contactez-nous via le formulaire de contact.</p>
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
                    src="/images/cactaïa-09.jpg"
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
                            <FileText className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-light mb-4">Transparence et confiance</h2>
                        <p className="text-lg text-white/90 max-w-md">
                            Nos conditions générales de vente vous garantissent une expérience d'achat sécurisée et transparente
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
} 