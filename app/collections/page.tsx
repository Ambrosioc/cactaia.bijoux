"use client"

import HeroSection from '@/components/ui/hero-section';
import OptimizedImage from '@/components/ui/optimized-image';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

interface Collection {
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les collections uniques
      const { data: collectionsData, error: collectionsError } = await supabase
        .rpc('get_unique_collections');

      if (collectionsError) {
        throw collectionsError;
      }

      // Créer les objets collection avec les informations
      const collectionsWithInfo: Collection[] = collectionsData.map((collectionName: string) => {
        const slug = collectionName.toLowerCase()
          .replace(/[éèê]/g, 'e')
          .replace(/[àâ]/g, 'a')
          .replace(/[ùû]/g, 'u')
          .replace(/[ôö]/g, 'o')
          .replace(/[îï]/g, 'i')
          .replace(/[ç]/g, 'c')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        return {
          name: collectionName,
          slug,
          description: getCollectionDescription(collectionName),
          image: getCollectionImage(collectionName),
          productCount: 0 // Sera mis à jour plus tard
        };
      });

      // Compter les produits pour chaque collection
      const collectionsWithCounts = await Promise.all(
        collectionsWithInfo.map(async (collection) => {
          const { count, error: countError } = await supabase
            .from('produits')
            .select('*', { count: 'exact', head: true })
            .eq('est_actif', true)
            .contains('collections', [collection.name]);

          if (countError) {
            console.error(`Erreur pour compter les produits de ${collection.name}:`, countError);
            return { ...collection, productCount: 0 };
          }

          return { ...collection, productCount: count || 0 };
        })
      );

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error);
      setError('Erreur lors du chargement des collections');
    } finally {
      setLoading(false);
    }
  };

  const getCollectionDescription = (collectionName: string): string => {
    const descriptions: { [key: string]: string } = {
      'Été 2025': 'Notre collection estivale avec des pièces légères et colorées parfaites pour la saison chaude.',
      'Nouveautés': 'Découvrez nos dernières créations, des pièces uniques et tendance.',
      'Bestsellers': 'Nos produits les plus populaires, ceux que nos clients adorent.',
      'Désert': 'Collection inspirée par les paysages désertiques et la nature sauvage.',
      'Mixte': 'Des bijoux et accessoires qui conviennent à tous les styles et genres.',
      'Femme': 'Collection spécialement conçue pour les femmes avec des pièces élégantes.',
      'Homme': 'Des accessoires et bijoux masculins avec un style moderne et sophistiqué.'
    };
    return descriptions[collectionName] || `Découvrez notre collection ${collectionName.toLowerCase()} avec des pièces uniques et élégantes.`;
  };

  const getCollectionImage = (collectionName: string): string => {
    const imageMap: { [key: string]: string } = {
      'Été 2025': '/images/cactaïa-04.jpg',
      'Nouveautés': '/images/cactaïa-05.jpg',
      'Bestsellers': '/images/cactaïa-06.jpg',
      'Désert': '/images/cactaïa-07.jpg',
      'Mixte': '/images/cactaïa-08.jpg',
      'Femme': '/images/cactaïa-09.jpg',
      'Homme': '/images/cactaïa-10.jpg'
    };
    return imageMap[collectionName] || '/images/cactaïa-01.jpg';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
        <div className="container-custom py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={loadCollections}
              className="btn bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="aspect-[3/4] bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🌵</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Aucune collection disponible</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Aucune collection n&apos;est disponible pour le moment. Revenez bientôt !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection, i) => (
                <motion.div
                  key={collection.slug}
                  custom={i}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="group"
                >
                  <Link href={`/collection/${collection.slug}`}>
                    <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-2xl shadow-sm group-hover:shadow-xl transition-all duration-300">
                      <OptimizedImage
                        src={collection.image}
                        alt={collection.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-colors duration-300" />

                      {/* Badge avec le nombre de produits */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 text-xs px-3 py-1 rounded-full font-medium">
                        {collection.productCount} produit{collection.productCount > 1 ? 's' : ''}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {collection.name}
                        </h2>
                        <p className="text-white/90 text-sm leading-relaxed">
                          {collection.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}