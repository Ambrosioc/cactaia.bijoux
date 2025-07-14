'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <Image
            src="/images/cactaïa-14.jpg"
            alt="Notre atelier"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative h-full container-custom flex items-center">
          <div className="max-w-2xl">
            <h1 className="heading-xl text-white mb-4">Notre histoire</h1>
            <p className="text-white/90 text-lg max-w-xl">
              Découvrez comment Cactaia.Bijoux est née d&apos;une passion pour les bijoux intemporels et l&apos;élégance naturelle.
            </p>
          </div>
        </div>
      </section>

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
                Cactaia.Bijoux est née en 2020, d&apos;une passion partagée pour la joaillerie et la nature. Notre fondatrice, inspirée par la force et la beauté des cactus, a voulu créer des bijoux qui allient durabilité, élégance et caractère.
              </p>
              <p className="text-muted-foreground mb-4">
                Le nom &quot;Cactaia&quot; évoque ces plantes résistantes mais délicates, capables de s&apos;adapter aux environnements les plus hostiles tout en conservant leur beauté unique. Une métaphore parfaite pour nos créations qui vous accompagnent au quotidien, résistant à l&apos;épreuve du temps.
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
                src="https://images.pexels.com/photos/6767893/pexels-photo-6767893.jpeg"
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
                src="https://images.pexels.com/photos/7276787/pexels-photo-7276787.jpeg"
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
                Notre vision est de créer des bijoux qui transcendent les modes, s&apos;inscrivant dans une démarche d&apos;élégance naturelle et durable. Nous concevons chaque pièce comme un héritage, destiné à être transmis de génération en génération.
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
                image: "https://images.pexels.com/photos/9428804/pexels-photo-9428804.jpeg"
              },
              {
                title: "Intemporalité",
                description: "Nos créations transcendent les tendances éphémères pour offrir une élégance durable qui ne se démode jamais.",
                image: "https://images.pexels.com/photos/13237864/pexels-photo-13237864.jpeg"
              },
              {
                title: "Force et Sensibilité",
                description: "Comme le cactus, nos bijoux allient robustesse et délicatesse, reflétant la dualité qui existe en chacun de nous.",
                image: "https://images.pexels.com/photos/7794536/pexels-photo-7794536.jpeg"
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

      {/* Team Section */}
      <section className="py-20 bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-4">Notre équipe</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des passionnés qui donnent vie à chaque création Cactaia.Bijoux avec savoir-faire et dévouement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Marie Laurent",
                role: "Fondatrice & Designer",
                image: "https://images.pexels.com/photos/4467623/pexels-photo-4467623.jpeg"
              },
              {
                name: "Thomas Ricard",
                role: "Artisan Joaillier",
                image: "https://images.pexels.com/photos/14541208/pexels-photo-14541208.jpeg"
              },
              {
                name: "Sophie Merlin",
                role: "Responsable Marketing",
                image: "https://images.pexels.com/photos/5325599/pexels-photo-5325599.jpeg"
              }
            ].map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative w-48 h-48 mx-auto mb-4 overflow-hidden rounded-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}