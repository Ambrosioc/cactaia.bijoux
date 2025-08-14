"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import HeroImage from '@/components/ui/hero-image';
import { motion } from 'framer-motion';
import { ArrowRight, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("Commandes et livraisons");

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
            <h1 className="text-3xl font-light text-gray-900 mb-2">Questions fréquentes</h1>
            <p className="text-gray-600">
              Trouvez des réponses à toutes vos questions
            </p>
          </div>

          {/* Navigation des catégories */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {faqData.map(category => (
                <button
                  key={category.category}
                  onClick={() => setActiveCategory(category.category)}
                  className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 ${activeCategory === category.category
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {category.category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{activeCategory}</h2>

            <Accordion type="single" collapsible className="space-y-3">
              {faqData
                .find(category => category.category === activeCategory)?.items
                .map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white/70"
                  >
                    <AccordionTrigger className="text-left py-3 px-4 hover:no-underline text-sm font-medium text-gray-900">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-sm py-3 px-4 leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>

          {/* Contact CTA */}
          <div className="mt-6 bg-primary/10 p-6 rounded-xl text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Vous n&apos;avez pas trouvé la réponse ?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Notre équipe est là pour vous répondre
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/25"
            >
              Nous contacter
              <ArrowRight className="h-4 w-4" />
            </Link>
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
          src="/images/cactaïa-13.jpg"
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
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-light mb-4">Nous sommes là pour vous aider</h2>
            <p className="text-lg text-white/90 max-w-md">
              Trouvez rapidement des réponses à toutes vos questions sur nos bijoux et services
            </p>
          </motion.div>
        </HeroImage>
      </div>
    </div>
  );
}

const faqData = [
  {
    category: "Commandes et livraisons",
    items: [
      {
        question: "Quels sont les délais de livraison ?",
        answer: "Nos commandes sont généralement traitées dans les 24 à 48h. Les délais de livraison varient ensuite selon votre localisation : 2-3 jours ouvrés en France métropolitaine, 5-7 jours pour l'Europe, et 7-14 jours pour le reste du monde."
      },
      {
        question: "La livraison est-elle offerte ?",
        answer: "La livraison est offerte en France métropolitaine pour toute commande supérieure à 50€. Pour les autres destinations, les frais de port sont calculés en fonction du poids et de la destination."
      },
      {
        question: "Comment suivre ma commande ?",
        answer: "Un email de confirmation avec un numéro de suivi vous sera envoyé dès l'expédition de votre commande. Vous pourrez suivre votre colis directement depuis votre espace client ou via le lien fourni dans l'email."
      }
    ]
  },
  {
    category: "Produits",
    items: [
      {
        question: "Quels matériaux utilisez-vous pour vos bijoux ?",
        answer: "Nos bijoux sont principalement fabriqués en acier inoxydable 316L, hypoallergénique et durable. Certaines pièces peuvent contenir des éléments en plaqué or 18 carats, en argent 925 ou des pierres naturelles, toujours dans une démarche écoresponsable."
      },
      {
        question: "Comment entretenir mes bijoux Cactaia ?",
        answer: "Pour préserver l'éclat de vos bijoux, évitez le contact avec l'eau, les parfums et les produits cosmétiques. Nettoyez-les délicatement avec un chiffon doux et sec. Pour un nettoyage plus approfondi, utilisez de l'eau tiède savonneuse et séchez-les immédiatement."
      },
      {
        question: "Vos bijoux conviennent-ils aux personnes allergiques ?",
        answer: "Oui, nos bijoux en acier inoxydable 316L sont hypoallergéniques et conviennent à la grande majorité des personnes, même celles avec une peau sensible. Cependant, en cas d'allergie connue aux métaux, nous vous recommandons de consulter la composition détaillée de chaque produit."
      }
    ]
  },
  {
    category: "Retours et garantie",
    items: [
      {
        question: "Quelle est votre politique de retour ?",
        answer: "Vous disposez de 14 jours à compter de la réception pour nous retourner un article qui ne vous convient pas. L'article doit être dans son état d'origine, non porté et dans son emballage d'origine. Les frais de retour sont à votre charge."
      },
      {
        question: "Ma commande est abîmée, que faire ?",
        answer: "Si vous recevez un produit endommagé, contactez-nous dans les 48h suivant la réception avec des photos du colis et du produit à contact@cactaiabijoux.fr. Nous vous proposerons un remplacement ou un remboursement selon votre préférence."
      },
      {
        question: "Quelle est la garantie sur vos bijoux ?",
        answer: "Tous nos bijoux bénéficient d'une garantie d'un an couvrant les défauts de fabrication. Cette garantie ne couvre pas l'usure normale, les dommages accidentels ou l'utilisation inappropriée."
      }
    ]
  },
  {
    category: "Compte client",
    items: [
      {
        question: "Comment créer un compte client ?",
        answer: "Vous pouvez créer un compte client directement lors de votre première commande ou en cliquant sur 'Mon compte' dans le menu. Renseignez simplement votre email et créez un mot de passe sécurisé."
      },
      {
        question: "J'ai oublié mon mot de passe, comment le récupérer ?",
        answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié' et suivez les instructions. Un email vous sera envoyé avec un lien pour réinitialiser votre mot de passe."
      }
    ]
  }
];