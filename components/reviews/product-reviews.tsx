'use client';

import { reviewSystem } from '@/lib/reviews/review-system';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Flag,
    MessageSquare,
    Package,
    Star,
    ThumbsDown,
    ThumbsUp,
    TrendingUp,
    User,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    title: string;
    comment: string;
    helpful_votes: number;
    total_votes: number;
    is_verified_purchase: boolean;
    created_at: string;
    users: {
        nom: string;
        prenom: string;
    };
    status: string;
}

interface ReviewStats {
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

interface ProductReviewsProps {
    productId: string;
    productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const { user } = useUser();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        rating: 0,
        verified_only: false,
        sort_by: 'newest' as const
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [canReview, setCanReview] = useState(false);

    const reviewsPerPage = 5;

    useEffect(() => {
        loadReviews();
        loadStats();
        checkCanReview();
    }, [productId, filters, currentPage]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const offset = (currentPage - 1) * reviewsPerPage;
            const result = await reviewSystem.getProductReviews(
                productId,
                filters,
                reviewsPerPage,
                offset
            );
            setReviews(result.reviews as Review[]);
            setTotalReviews(result.total);
        } catch (error) {
            console.error('Erreur lors du chargement des avis:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const statsData = await reviewSystem.getProductReviewStats(productId);
            setStats(statsData);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    };

    const checkCanReview = async () => {
        if (!user) return;

        try {
            // Vérifier si l'utilisateur peut laisser un avis
            const { data } = await (reviewSystem as any).supabase.rpc('can_user_review', {
                user_uuid: user.id,
                product_uuid: productId
            });
            setCanReview(data);
        } catch (error) {
            console.error('Erreur lors de la vérification:', error);
        }
    };

    const handleVote = async (reviewId: string, isHelpful: boolean) => {
        if (!user) return;

        try {
            const success = await reviewSystem.voteReview(reviewId, user.id, isHelpful);
            if (success) {
                // Recharger les avis pour mettre à jour les votes
                await loadReviews();
            }
        } catch (error) {
            console.error('Erreur lors du vote:', error);
        }
    };

    const handleReport = async (reviewId: string) => {
        if (!user) return;

        const reason = prompt('Raison du signalement:');
        if (!reason) return;

        try {
            const success = await reviewSystem.reportReview(reviewId, user.id, reason);
            if (success) {
                alert('Avis signalé avec succès');
            }
        } catch (error) {
            console.error('Erreur lors du signalement:', error);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
            />
        ));
    };

    const renderRatingBar = (rating: number, count: number, total: number) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
            <div className="flex items-center gap-2 text-sm">
                <span className="w-8">{rating} étoiles</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="w-12 text-right">{count}</span>
            </div>
        );
    };

    const totalPages = Math.ceil(totalReviews / reviewsPerPage);

    if (!stats) {
        return (
            <div className="py-8">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            {/* Header avec statistiques */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-medium mb-2">Avis clients</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {renderStars(Math.round(stats.average_rating))}
                            </div>
                            <span className="text-lg font-medium">{stats.average_rating}</span>
                        </div>
                        <span className="text-muted-foreground">
                            Basé sur {stats.total_reviews} avis
                        </span>
                        {stats.verified_purchases > 0 && (
                            <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">{stats.verified_purchases} achats vérifiés</span>
                            </div>
                        )}
                    </div>
                </div>

                {canReview && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="btn btn-primary"
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Laisser un avis
                    </button>
                )}
            </div>

            {/* Distribution des notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating}>
                            {renderRatingBar(rating, stats.rating_distribution[rating as keyof typeof stats.rating_distribution], stats.total_reviews)}
                        </div>
                    ))}
                </div>

                {/* Filtres */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Filtrer par note</label>
                        <select
                            value={filters.rating}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, rating: Number(e.target.value) }));
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value={0}>Toutes les notes</option>
                            <option value={5}>5 étoiles</option>
                            <option value={4}>4 étoiles</option>
                            <option value={3}>3 étoiles</option>
                            <option value={2}>2 étoiles</option>
                            <option value={1}>1 étoile</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Trier par</label>
                        <select
                            value={filters.sort_by}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, sort_by: e.target.value as any }));
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="newest">Plus récents</option>
                            <option value="oldest">Plus anciens</option>
                            <option value="rating">Note la plus haute</option>
                            <option value="helpful">Plus utiles</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="verified-only"
                            checked={filters.verified_only}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, verified_only: e.target.checked }));
                                setCurrentPage(1);
                            }}
                            className="rounded border-gray-300"
                        />
                        <label htmlFor="verified-only" className="text-sm">
                            Achats vérifiés uniquement
                        </label>
                    </div>
                </div>
            </div>

            {/* Liste des avis */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : reviews.length > 0 ? (
                    reviews.map((review, index) => {
                        const StatusIcon = getStatusIcon(review.status);

                        return (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="border border-gray-200 rounded-lg p-6"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {review.users.prenom} {review.users.nom}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <div className="flex">
                                                    {renderStars(review.rating)}
                                                </div>
                                                {review.is_verified_purchase && (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle className="h-3 w-3" />
                                                        <span>Achat vérifié</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-medium mb-2">{review.title}</h3>
                                    <p className="text-gray-700">{review.comment}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleVote(review.id, true)}
                                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-600"
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            <span>Utile ({review.helpful_votes})</span>
                                        </button>
                                        <button
                                            onClick={() => handleVote(review.id, false)}
                                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-600"
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                            <span>Pas utile ({review.total_votes - review.helpful_votes})</span>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleReport(review.id)}
                                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-600"
                                    >
                                        <Flag className="h-4 w-4" />
                                        <span>Signaler</span>
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucun avis trouvé</h3>
                        <p className="text-muted-foreground">
                            Soyez le premier à laisser un avis pour ce produit !
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-input rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <ChevronUp className="h-4 w-4 rotate-90" />
                        </button>

                        <span className="px-3 py-2 text-sm">
                            Page {currentPage} sur {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-input rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <ChevronDown className="h-4 w-4 rotate-90" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal pour laisser un avis */}
            {showReviewForm && (
                <ReviewForm
                    productId={productId}
                    productName={productName}
                    onClose={() => setShowReviewForm(false)}
                    onSuccess={() => {
                        setShowReviewForm(false);
                        loadReviews();
                        loadStats();
                        checkCanReview();
                    }}
                />
            )}
        </div>
    );
}

// Composant pour le formulaire d'avis
interface ReviewFormProps {
    productId: string;
    productName: string;
    onClose: () => void;
    onSuccess: () => void;
}

function ReviewForm({ productId, productName, onClose, onSuccess }: ReviewFormProps) {
    const { user } = useUser();
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title || !comment) return;

        setLoading(true);
        try {
            const review = await reviewSystem.createReview({
                product_id: productId,
                user_id: user.id,
                rating,
                title,
                comment,
                status: 'pending',
                is_verified_purchase: false
            });

            if (review) {
                onSuccess();
            }
        } catch (error) {
            console.error('Erreur lors de la création de l\'avis:', error);
            alert('Erreur lors de la création de l\'avis');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
            >
                ★
            </button>
        ));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-medium mb-4">Laisser un avis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    {productName}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Note</label>
                        <div className="flex gap-1">
                            {renderStars(rating)}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Titre</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Titre de votre avis"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Commentaire</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Partagez votre expérience avec ce produit..."
                            required
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading || !title || !comment}
                            className="btn btn-primary flex-1"
                        >
                            {loading ? 'Envoi...' : 'Publier l\'avis'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline flex-1"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Fonction helper pour obtenir l'icône de statut
function getStatusIcon(status: string) {
    switch (status) {
        case 'out_of_stock':
            return X;
        case 'low_stock':
            return AlertTriangle;
        case 'overstock':
            return TrendingUp;
        default:
            return Package;
    }
} 