import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';

export interface Review {
  id?: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful_votes: number;
  total_votes: number;
  is_verified_purchase: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verified_purchases: number;
}

export interface ReviewFilters {
  rating?: number;
  verified_only?: boolean;
  sort_by?: 'newest' | 'oldest' | 'rating' | 'helpful';
}

export class ReviewSystem {
  private supabase;

  constructor(isServer = false) {
    this.supabase = isServer ? createServerClient() : createClient();
  }

  // Créer un nouvel avis
  async createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'helpful_votes' | 'total_votes'>): Promise<Review | null> {
    try {
      const supabase = await this.supabase;
      // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', review.product_id)
        .eq('user_id', review.user_id)
        .single();

      if (existingReview) {
        throw new Error('Vous avez déjà laissé un avis pour ce produit');
      }

      // Vérifier si l'utilisateur a acheté le produit (pour verified_purchase)
      const isVerifiedPurchase = await this.checkVerifiedPurchase(review.user_id, review.product_id);

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...review,
          is_verified_purchase: isVerifiedPurchase,
          helpful_votes: 0,
          total_votes: 0,
          status: 'pending' // Par défaut en attente de modération
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        ...data,
        order_id: data.order_id || undefined,
        status: data.status as 'pending' | 'approved' | 'rejected',
        helpful_votes: data.helpful_votes ?? 0,
        total_votes: data.total_votes ?? 0,
        is_verified_purchase: data.is_verified_purchase ?? false,
        created_at: data.created_at || undefined,
        updated_at: data.updated_at || undefined
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      return null;
    }
  }

  // Obtenir les avis d'un produit
  async getProductReviews(
    productId: string, 
    filters: ReviewFilters = {}, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<{ reviews: Review[]; total: number }> {
    try {
      const supabase = await this.supabase;
      let query = supabase
        .from('reviews')
        .select('*, users!inner(nom, prenom)', { count: 'exact' })
        .eq('product_id', productId)
        .eq('status', 'approved');

      // Appliquer les filtres
      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }

      if (filters.verified_only) {
        query = query.eq('is_verified_purchase', true);
      }

      // Appliquer le tri
      switch (filters.sort_by) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'helpful':
          query = query.order('helpful_votes', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        reviews: (data || []).map(review => ({
          ...review,
          order_id: review.order_id || undefined,
          status: review.status as 'pending' | 'approved' | 'rejected',
          helpful_votes: review.helpful_votes ?? 0,
          total_votes: review.total_votes ?? 0,
          is_verified_purchase: review.is_verified_purchase ?? false,
          created_at: review.created_at || undefined,
          updated_at: review.updated_at || undefined
        })),
        total: count || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      return { reviews: [], total: 0 };
    }
  }

  // Obtenir les statistiques d'avis d'un produit
  async getProductReviewStats(productId: string): Promise<ReviewStats | null> {
    try {
      const supabase = await this.supabase;
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating, is_verified_purchase')
        .eq('product_id', productId)
        .eq('status', 'approved');

      if (error) {
        throw error;
      }

      if (!reviews || reviews.length === 0) {
        return {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          verified_purchases: 0
        };
      }

      const totalReviews = reviews.length;
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      const verifiedPurchases = reviews.filter(review => review.is_verified_purchase).length;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      return {
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: totalReviews,
        rating_distribution: ratingDistribution,
        verified_purchases: verifiedPurchases
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return null;
    }
  }

  // Voter pour un avis (utile/pas utile)
  async voteReview(reviewId: string, userId: string, isHelpful: boolean): Promise<boolean> {
    try {
      const supabase = await this.supabase;
      // Vérifier si l'utilisateur a déjà voté
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('id, is_helpful')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        // Mettre à jour le vote existant
        const { error: updateError } = await supabase
          .from('review_votes')
          .update({ is_helpful: isHelpful, updated_at: new Date().toISOString() })
          .eq('id', existingVote.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Créer un nouveau vote
        const { error: insertError } = await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            user_id: userId,
            is_helpful: isHelpful
          });

        if (insertError) {
          throw insertError;
        }
      }

      // Mettre à jour les statistiques de l'avis
      await this.updateReviewVoteStats(reviewId);

      return true;
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      return false;
    }
  }

  // Signaler un avis
  async reportReview(reviewId: string, userId: string, reason: string): Promise<boolean> {
    try {
      const supabase = await this.supabase;
      const { error } = await supabase
        .from('review_reports')
        .insert({
          review_id: reviewId,
          user_id: userId,
          reason: reason
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      return false;
    }
  }

  // Modérer un avis (admin seulement)
  async moderateReview(reviewId: string, status: 'approved' | 'rejected', moderatorId: string, reason?: string): Promise<boolean> {
    try {
      const supabase = await this.supabase;
      const { error } = await supabase
        .from('reviews')
        .update({
          status: status,
          moderated_by: moderatorId,
          moderation_reason: reason,
          moderated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la modération:', error);
      return false;
    }
  }

  // Obtenir les avis en attente de modération
  async getPendingReviews(limit: number = 20, offset: number = 0): Promise<Review[]> {
    try {
      const supabase = await this.supabase;
      const { data, error } = await supabase
        .from('reviews')
        .select('*, users!inner(nom, prenom), produits!inner(nom)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return (data || []).map(review => ({
        ...review,
        order_id: review.order_id || undefined,
        status: review.status as 'pending' | 'approved' | 'rejected',
        helpful_votes: review.helpful_votes ?? 0,
        total_votes: review.total_votes ?? 0,
        is_verified_purchase: review.is_verified_purchase ?? false,
        created_at: review.created_at || undefined,
        updated_at: review.updated_at || undefined
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des avis en attente:', error);
      return [];
    }
  }

  // Vérifier si l'utilisateur a acheté le produit
  private async checkVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
    try {
      const supabase = await this.supabase;
      const { data: orders, error } = await supabase
        .from('commandes')
        .select('produits, statut')
        .eq('user_id', userId)
        .eq('statut', 'payee');

      if (error || !orders) {
        return false;
      }

      // Vérifier si le produit est dans les commandes payées
      return orders.some(order => {
        if (order.produits && Array.isArray(order.produits)) {
          return order.produits.some((item: any) => item.product_id === productId);
        }
        return false;
      });
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'achat:', error);
      return false;
    }
  }

  // Mettre à jour les statistiques de vote d'un avis
  private async updateReviewVoteStats(reviewId: string): Promise<void> {
    try {
      const supabase = await this.supabase;
      const { data: votes, error } = await supabase
        .from('review_votes')
        .select('is_helpful')
        .eq('review_id', reviewId);

      if (error || !votes) {
        return;
      }

      const helpfulVotes = votes.filter(vote => vote.is_helpful).length;
      const totalVotes = votes.length;

      await supabase
        .from('reviews')
        .update({
          helpful_votes: helpfulVotes,
          total_votes: totalVotes
        })
        .eq('id', reviewId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
    }
  }
}

// Instances globales
export const reviewSystem = new ReviewSystem(false); // Client-side
export const serverReviewSystem = new ReviewSystem(true); // Server-side 