'use client';

import HeroSection from '@/components/ui/hero-section';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const XarrowNoSSR = dynamic(() => import('react-xarrows').then(m => m.default), { ssr: false });

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="pb-16">
      {/* Hero Banner */}
      <HeroSection image="/images/cactaïa-14.jpg" alt="Notre atelier" priority>
        <h1 className="heading-xl text-white mb-4">Notre histoire</h1>
        <p className="text-white/90 text-lg max-w-xl">
          Découvrez comment Cactaia. Bijoux est né d&apos;une passion pour les bijoux et l&apos;élégance naturelle.
        </p>
      </HeroSection>

      {/* Our Story */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="heading-lg mb-6">L&apos;histoire de Cactaia</h2>
              <p className="text-muted-foreground mb-4">
                Cactaia.Bijoux est né en 2020, d&apos;une passion partagée pour la joaillerie et la nature. Nos fondateurs, inspirés par la force et la beauté des cactus, ont voulu créer des bijoux qui allient durabilité, élégance, caractère et Amour.
              </p>
              <p className="text-muted-foreground mb-4">
                Le nom &quot;Cactaia&quot; évoque ces plantes résistantes, mais délicates, capables de s&apos;adapter aux environnements les plus hostiles tout en conservant leur beauté unique. Une métaphore parfaite pour nos créations qui vous accompagnent au quotidien, résistant à l&apos;épreuve du Temps.
              </p>
              <p className="text-muted-foreground">
                Chaque bijou est pensé comme une pièce intemporelle, conçue avec soin pour sublimer votre personnalité sans jamais l&apos;éclipser. Nos créations sont le reflet de notre philosophie : l&apos;élégance dans la simplicité.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[500px]"
            >
              <Image
                src="/images/DSC07444.jpg"
                alt="Notre atelier"
                fill
                className="object-cover rounded-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>


      {/* Our Vision */}
      <section className="py-20 bg-secondary">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="order-2 md:order-1 relative h-[500px]"
            >
              <Image
                src="/images/DSC07559.jpg"
                alt="Notre vision"
                fill
                className="object-cover rounded-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="order-1 md:order-2"
            >
              <h2 className="heading-lg mb-6">Notre vision</h2>
              <p className="text-muted-foreground mb-4">
                Chez Cactaia.Bijoux, nous croyons que les bijoux ne sont pas de simples accessoires, mais des témoins de notre histoire personnelle, des symboles qui nous accompagnent tout au long de notre vie.
              </p>
              <p className="text-muted-foreground mb-4">
                Notre vision est de créer des bijoux qui transcendent les modes, s&apos;inscrivant dans une démarche d&apos;élégance naturelle, mais aussi durable. Nous concevons chaque pièce comme un héritage, destiné à être transmis de génération en génération.
              </p>
              <p className="text-muted-foreground">
                En équilibrant force et sensibilité, nos créations incarnent la dualité qui existe en chacun de nous. Elles sont pensées pour tous, sans distinction de genre, célébrant l&apos;individualité dans toute sa diversité.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-4">Nos valeurs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des principes qui guident chacune de nos créations et chacun de nos choix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Transmission",
                description: "Nous concevons des bijoux intemporels destinés à traverser les générations, porteurs d'histoires et de souvenirs.",
                image: "/images/DSC07571.jpg"
              },
              {
                title: "Intemporalité",
                description: "Nos créations transcendent les tendances éphémères pour offrir une élégance durable qui ne se démode jamais.",
                image: "/images/DSC07817.jpg"
              },
              {
                title: "Force et Sensibilité",
                description: "Comme le cactus, nos bijoux allient robustesse et délicatesse, reflétant la dualité qui existe en chacun de nous.",
                image: "/images/DSC07837_1.jpg"
              }
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col"
              >
                <div className="relative aspect-square mb-6 overflow-hidden rounded-lg">
                  <Image
                    src={value.image}
                    alt={value.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Core Values - Extended */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg">Valeurs Fondamentales de la Marque</h2>
          </div>

          {/* Cards grid with motion */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, staggerChildren: 0.08 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: "💗",
                title: "Amour",
                bullets: [
                  "Intimité consciente : Chaque geste, chaque création est une preuve d’amour à soi et aux autres.",
                  "Transmission affective : Nos créations portent en elles des messages d'attachement, d’héritage et de douceur.",
                  "Amour libre : Un amour sans genre, sans forme fixe, mais toujours sincère."
                ]
              },
              {
                icon: "⏳",
                title: "Temps",
                bullets: [
                  "L’intemporel : Des créations qui traversent les modes comme les âges.",
                  "Présence : Porter nos bijoux, c’est marquer l’instant et vivre chaque moment avec intensité.",
                  "Patience artisanale : Chaque pièce prend le temps d’exister pleinement, loin de la production rapide."
                ]
              },
              {
                icon: "🖤",
                title: "Mort",
                bullets: [
                  "Mémoire et symboles : Nos pièces rappellent que chaque fin contient une beauté. Elles honorent les cycles, les pertes, les renaissances.",
                  "Bijoux comme talismans : Pour se souvenir, se protéger, se reconnecter à ce qui compte.",
                  "Renaissance : Parce que de chaque chute naît une autre lumière."
                ]
              },
              {
                icon: "🌱",
                title: "Durabilité",
                bullets: [
                  "Choix éthiques : Matériaux résistants, recyclables, éco-pensés.",
                  "Créations durables : Pensées pour durer, se transmettre, et rester belles avec le temps.",
                  "Moins mais mieux : Chaque bijou a du sens, aucune création n’est superflue."
                ]
              },
              {
                icon: "⚧️",
                title: "Respect des genres",
                bullets: [
                  "Beauté universelle : Nos créations sont faites pour tous les corps, sans étiquette.",
                  "Libre expression : Porter ce qui nous fait du bien, pas ce que dicte la norme.",
                  "Inclusivité réelle : Des modèles, des voix, des récits pluriels."
                ]
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-xl border p-6 bg-background hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl" aria-hidden>{item.icon}</div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
                  {item.bullets.map((b) => (
                    <li key={b.slice(0, 24)}>{b}</li>
                  ))}
                </ul>
                <motion.div
                  aria-hidden
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.06 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Poetic statements with subtle motion */}
          <div className="mt-16 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center space-y-2 text-muted-foreground">
                <p><strong>A</strong>mour pour la beauté intemporelle.</p>
                <p><strong>M</strong>agnifiant chaque instant avec élégance</p>
                <p><strong>O</strong>ffrant des souvenirs précieux à chaque regard</p>
                <p><strong>U</strong>n bijou qui symbolise la force et la finesse d&apos;un homme amoureux de l&apos;excellence.</p>
                <p><strong>R</strong>evêtir un tel trésor, c&apos;est porter l&apos;amour dans son cœur et dans son style.</p>
              </div>
            </motion.div>

            <div className="h-px bg-border" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <div className="text-center space-y-2 text-muted-foreground">
                <p><strong>T</strong>ranscendant les époques, Cactaia devient le témoin d’une histoire personnelle.</p>
                <p><strong>É</strong>ternel dans sa beauté, capture l’instant et le conserve pour l’avenir.</p>
                <p><strong>M</strong>arquée par le temps, chaque pièce raconte l&apos;évolution d’un homme.</p>
                <p><strong>P</strong>orté avec fierté, il résiste aux années, symbole d’un amour et d’une fidélité sans fin.</p>
                <p><strong>S</strong>ous son éclat, le temps s’efface, laissant une empreinte éternelle dans l’âme.</p>
              </div>
            </motion.div>

            <div className="h-px bg-border" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-center space-y-2 text-muted-foreground">
                <p><strong>M</strong>ême le temps ne peut éclipser</p>
                <p><strong>O</strong>n défie la fin, car un bijou inscrit son éclat immortel</p>
                <p><strong>R</strong>ésistant à l’épreuve de la mort, il traverse les âges, intact.</p>
                <p><strong>T</strong>emporel dans son essence, il survit à tout, symbolisant une vie au-delà des générations.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Did you know - Stainless steel jewelry */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="heading-lg mb-2">Le saviez-vous ?</h2>
            <p className="text-lg text-muted-foreground">Qu’est-ce que des bijoux en acier inoxydable ?</p>
          </motion.div>

          {/* Contenu SSR identique côté serveur/client */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground">
                Les bijoux en acier inoxydable sont des accessoires fabriqués à partir d&apos;un alliage de fer, de carbone, de chrome et parfois d&apos;autres métaux. L&apos;acier inoxydable est réputé pour sa résistance à la corrosion, à la rouille et aux taches, ce qui en fait un choix populaire pour les bijoux.
              </p>
              <div id="steel-bubble" className="relative inline-block max-w-xl rounded-2xl border border-primary/30 bg-secondary/30 p-4 md:p-5 shadow-sm">
                <p className="text-sm md:text-base font-medium text-foreground">
                  Voici quelque caractéristiques importantes des bijoux en acier inoxydable
                </p>
              </div>
            </motion.div>

            {/* Features cards */}
            <motion.div id="steel-features"
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {[
                {
                  title: "Résistance à la corrosion",
                  desc:
                    "L’acier inoxydable est résistant à la corrosion, moins susceptible de rouiller ou de ternir avec le temps, même exposé à l’humidité ou à la transpiration.",
                },
                {
                  title: "Hypoallergénique",
                  desc:
                    "Souvent une bonne option pour les peaux sensibles : généralement hypoallergénique et moins susceptible de provoquer des réactions cutanées.",
                },
                {
                  title: "Durabilité",
                  desc:
                    "Relativement durable et résistant aux rayures, idéal pour un usage quotidien.",
                },
                {
                  title: "Facilité d’entretien",
                  desc:
                    "Entretien simple : lavage à l’eau savonneuse et essuyage doux pour conserver l’éclat.",
                },
                {
                  title: "Variété de styles",
                  desc:
                    "Large diversité de styles, du classique au contemporain, s’adaptant à toutes les occasions.",
                },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  id={i === 0 ? 'steel-card-0' : undefined}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="relative overflow-hidden rounded-xl border bg-background p-5 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  <motion.div
                    aria-hidden
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.06 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Flèches client-only: desktop vers la grille, mobile vers la première card */}
          {mounted && (
            <>
              <span className="hidden lg:block">
                <XarrowNoSSR
                  start="steel-bubble"
                  end="steel-features"
                  startAnchor="right"
                  endAnchor="left"
                  color="#000000"
                  strokeWidth={2.5}
                  headSize={6}
                  curveness={0.6}
                />
              </span>
              <span className="block lg:hidden">
                <XarrowNoSSR
                  start="steel-bubble"
                  end="steel-card-0"
                  startAnchor="bottom"
                  endAnchor="top"
                  color="#000000"
                  strokeWidth={2.5}
                  headSize={6}
                  curveness={0.6}
                />
              </span>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-10 rounded-xl border p-6 bg-secondary/40"
          >
            <p className="text-center text-muted-foreground">
              En résumé, les bijoux en acier inoxydable sont appréciés pour leur durabilité, leur résistance à la corrosion et leur aspect esthétique, ce qui en fait un choix populaire pour de nombreux amateurs de bijoux.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}