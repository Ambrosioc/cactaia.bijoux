"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("Commandes et livraisons");

  return (
    <div className="pt-24 pb-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="heading-lg mb-4">Questions fréquentes</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trouvez des réponses à toutes vos questions concernant nos bijoux, commandes, livraisons et retours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-2">
              {faqData.map(category => (
                <button
                  key={category.category}
                  onClick={() => setActiveCategory(category.category)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors ${activeCategory === category.category
                    ? 'bg-primary text-white'
                    : 'bg-secondary hover:bg-secondary/80'
                    }`}
                >
                  {category.category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-medium mb-6">{activeCategory}</h2>

              <Accordion type="single" collapsible className="space-y-4">
                {faqData
                  .find(category => category.category === activeCategory)?.items
                  .map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`item-${i}`}
                      className="border border-border rounded-md px-6 overflow-hidden"
                    >
                      <AccordionTrigger className="text-left py-4 hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground py-4">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </div>

            {/* Contact CTA */}
            <div className="mt-12 bg-primary/5 p-6 rounded-lg text-center">
              <h3 className="text-xl font-medium mb-3">Vous n&apos;avez pas trouvé la réponse à votre question ?</h3>
              <p className="text-muted-foreground mb-4">
                Notre équipe est là pour vous répondre. N&apos;hésitez pas à nous contacter directement.
              </p>
              <a
                href="/contact"
                className="btn btn-primary px-6 py-2"
              >
                Nous contacter
              </a>
            </div>
          </motion.div>
        </div>
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