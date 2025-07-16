"use client";

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LegalNoticePage() {
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
            <h1 className="text-3xl font-light text-gray-900 mb-2">Mentions Légales</h1>
            <p className="text-gray-600">
              Informations juridiques et légales
            </p>
          </div>

          {/* Contenu mentions légales */}
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">1. Informations légales</h2>
              <p className="mb-3">Le site Cactaia.Bijoux est édité par :</p>
              <ul className="space-y-1 text-gray-600">
                <li>SARL Cactaia</li>
                <li>42 rue Maurice Violette</li>
                <li>28600 Luisant, France</li>
                <li>Capital social : 10 000€</li>
                <li>SIRET : 123 456 789 00012</li>
                <li>TVA Intracommunautaire : FR 12 345678900</li>
                <li>Email : contact@cactaiabijoux.fr</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">2. Hébergement</h2>
              <p className="mb-3">Le site est hébergé par :</p>
              <ul className="space-y-1 text-gray-600">
                <li>Société XYZ Hosting</li>
                <li>123 rue de l&apos;Hébergement</li>
                <li>75001 Paris, France</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">3. Propriété intellectuelle</h2>
              <p>L&apos;ensemble du contenu de ce site (textes, images, vidéos, etc.) est protégé par le droit d&apos;auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">4. Protection des données</h2>
              <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition aux données personnelles vous concernant. Contactez-nous à contact@cactaiabijoux.fr</p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">5. Cookies</h2>
              <p>Ce site utilise des cookies pour améliorer votre expérience de navigation. En continuant à naviguer, vous acceptez leur utilisation.</p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">6. Limitation de responsabilité</h2>
              <p>Cactaia.Bijoux s&apos;efforce d&apos;assurer l&apos;exactitude des informations diffusées sur ce site, mais ne peut garantir leur exhaustivité.</p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">7. Droit applicable</h2>
              <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
              <p className="text-xs text-gray-500 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
        <Image
          src="/images/cactaïa-12.jpg"
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
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-light mb-4">Transparence et légalité</h2>
            <p className="text-lg text-white/90 max-w-md">
              Toutes les informations légales nécessaires pour votre confiance
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}