'use client';

import OptimizedImage from '@/components/ui/optimized-image';
import { motion } from 'framer-motion';
import Link from 'next/link';

const collections = [
  {
    id: 'femme',
    name: 'Femme',
    image: '/images/cactaïa-12.jpg',
    description: 'Des bijoux délicats et élégants pour sublimer votre féminité',
  },
  {
    id: 'homme',
    name: 'Homme',
    image: '/images/cactaïa-07.jpg',
    description: 'Des pièces épurées et modernes pour un style authentique',
  },
  {
    id: 'mixte',
    name: 'Mixte',
    image: '/images/cactaïa-10.jpg',
    description: 'Des créations intemporelles et universelles pour tous',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.5,
    },
  }),
};

const CollectionShowcase = () => {
  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Nos collections</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos collections inspirées par la nature et conçues pour durer. Des bijoux qui accompagnent tous vos moments de vie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, i) => (
            <motion.div
              key={collection.id}
              custom={i}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="group"
            >
              <Link href={`/collection/${collection.id}`}>
                <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg">
                  <OptimizedImage
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-medium">{collection.name}</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{collection.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionShowcase;