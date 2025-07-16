'use client';

import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  user: {
    nom: string;
    prenom: string;
  };
  product: {
    nom: string;
  };
}

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadLatestReviews();
  }, []);

  const loadLatestReviews = async () => {
    try {
      setLoading(true);

      // Requête simple sur la table reviews avec les données de base
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          created_at,
          user_id,
          product_id
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(3);

      if (reviewsError) {
        console.error('Erreur lors du chargement des avis:', reviewsError);
        return;
      }

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        return;
      }

      // Récupérer les informations utilisateur et produit séparément
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const productIds = [...new Set(reviewsData.map(r => r.product_id))];

      // Récupérer les utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, nom, prenom')
        .in('id', userIds);

      if (usersError) {
        console.error('Erreur lors du chargement des utilisateurs:', usersError);
      }

      // Récupérer les produits
      const { data: productsData, error: productsError } = await supabase
        .from('produits')
        .select('id, nom')
        .in('id', productIds);

      if (productsError) {
        console.error('Erreur lors du chargement des produits:', productsError);
      }

      // Créer des maps pour un accès rapide
      const usersMap = new Map();
      const productsMap = new Map();

      usersData?.forEach(user => {
        usersMap.set(user.id, user);
      });

      productsData?.forEach(product => {
        productsMap.set(product.id, product);
      });

      // Transformer les données
      const transformedReviews = reviewsData.map(review => {
        const user = usersMap.get(review.user_id);
        const product = productsMap.get(review.product_id);

        return {
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          created_at: review.created_at || '',
          user: {
            nom: user?.nom || 'Client',
            prenom: user?.prenom || 'Anonyme'
          },
          product: {
            nom: product?.nom || 'Produit'
          }
        };
      });

      setReviews(transformedReviews);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4">Ce que nos clients disent</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez les témoignages de nos clients qui portent nos créations au quotidien.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 w-4 bg-gray-200 rounded mr-1" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Ce que nos clients disent</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les témoignages de nos clients qui portent nos créations au quotidien.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun avis client disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${j < review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <h4 className="font-medium mb-2 text-sm text-primary">
                  {review.title}
                </h4>
                <p className="text-muted-foreground mb-4 italic text-sm line-clamp-4">
                  &quot;{review.comment}&quot;
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {review.user?.prenom} {review.user?.nom?.charAt(0)}.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.product?.nom}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;