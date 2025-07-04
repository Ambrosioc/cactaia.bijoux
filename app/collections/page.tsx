"use client"

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { collections } from '@/lib/data/products';

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
    <div className="pt-24 pb-16">
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px]">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/7276787/pexels-photo-7276787.jpeg"
            alt="Collections Cactaia"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative h-full container-custom flex items-center">
          <div className="max-w-2xl">
            <h1 className="heading-xl text-white mb-4">Nos Collections</h1>
            <p className="text-white/90 text-lg">
              Découvrez nos collections inspirées par la nature et conçues pour durer.
            </p>
          </div>
        </div>
      </section>

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
                    <Image
                      src={`https://images.pexels.com/photos/${5370968 + i}/pexels-photo-${5370968 + i}.jpeg`}
                      alt={collection.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
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