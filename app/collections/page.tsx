"use client"

import HeroSection from '@/components/ui/hero-section';
import OptimizedImage from '@/components/ui/optimized-image';
import { collections } from '@/lib/data/products';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

export default function CollectionsPage() {
  return (
    <div className="pb-16">
      {/* Hero Banner */}
      <HeroSection image="/images/cactaïa-04.jpg" alt="Collections Cactaia" priority>
        <h1 className="heading-xl text-white mb-4">Nos Collections</h1>
        <p className="text-white/90 text-lg">
          Découvrez nos collections inspirées par la nature et conçues pour durer.
        </p>
      </HeroSection>

      {/* Collections Grid */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <Link href={`/collections/${collection.id}`}>
                  <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg">
                    <OptimizedImage
                      src={`${collection.image}`}
                      alt={collection.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h2 className="text-2xl font-medium mb-2">{collection.name}</h2>
                      <p className="text-white/90">{collection.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}