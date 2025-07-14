'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Review {
    id: string;
    rating: number;
    title: string;
    comment: string;
    is_verified_purchase: boolean;
    created_at: string;
    user?: {
        id: string;
        nom_complet: string;
    };
    product?: {
        id: string;
        nom: string;
    };
}

interface ReviewsSectionProps {
    productId?: string;
    limit?: number;
    showTitle?: boolean;
}

export default function ReviewsSection({
    productId,
    limit = 5,
    showTitle = true
}: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                limit: limit.toString(),
                status: 'approved'
            });

            if (productId) {
                params.append('product_id', productId);
            }

            const response = await fetch(`/api/reviews?${params}`);
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des avis');
            }

            const data = await response.json();
            setReviews(data.reviews || []);

            // Calculer les statistiques
            if (data.reviews && data.reviews.length > 0) {
                const totalRating = data.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
                const averageRating = totalRating / data.reviews.length;

                const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                data.reviews.forEach((review: Review) => {
                    distribution[review.rating as keyof typeof distribution]++;
                });

                setStats({
                    averageRating,
                    totalReviews: data.reviews.length,
                    ratingDistribution: distribution
                });
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="inline-block">
                {i < rating ? (
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                ) : (
                    <Star className="w-4 h-4 text-gray-300" />
                )}
            </span>
        ));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {showTitle && <Skeleton className="h-8 w-48" />}
                <div className="grid gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-4">
                    <p className="text-red-600">Erreur: {error}</p>
                </CardContent>
            </Card>
        );
    }

    if (reviews.length === 0) {
        return (
            <Card>
                <CardContent className="p-4 text-center text-gray-500">
                    Aucun avis disponible pour le moment.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {showTitle && (
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Avis clients</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                                {renderStars(Math.round(stats.averageRating))}
                            </div>
                            <span className="text-sm text-gray-600">
                                {stats.averageRating.toFixed(1)} sur 5 ({stats.totalReviews} avis)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Distribution des notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                        const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                        return (
                            <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm w-8">{rating}★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 w-8">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Liste des avis */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <Card key={review.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {renderStars(review.rating)}
                                    </div>
                                    <span className="font-medium text-sm">
                                        {review.user?.nom_complet || 'Client'}
                                    </span>
                                    {review.is_verified_purchase && (
                                        <Badge variant="secondary" className="text-xs">
                                            Achat vérifié
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">
                                    {formatDate(review.created_at)}
                                </span>
                            </div>

                            <h4 className="font-semibold text-sm mb-2">{review.title}</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {review.comment}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 