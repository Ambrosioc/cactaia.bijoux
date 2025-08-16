import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15',
});

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Vérifier l'authentification admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Vérifier le rôle admin
        const { data: profile } = await supabase
            .from('users')
            .select('role, active_role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.active_role !== 'admin') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }

        // Récupérer les paramètres de requête
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const period = searchParams.get('period');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        // Construire la requête Supabase
        let query = supabase
            .from('commandes')
            .select(`
                id,
                numero_commande,
                montant_total,
                statut,
                created_at,
                updated_at,
                user_id,
                stripe_payment_intent_id,
                users!inner(
                    nom,
                    prenom,
                    email
                )
            `)
            .not('stripe_payment_intent_id', 'is', null)
            .order('created_at', { ascending: false });

        // Filtrer par statut
        if (status && status !== 'all') {
            query = query.eq('statut', status);
        }

        // Filtrer par période
        if (period && period !== 'all') {
            const now = new Date();
            let startDate = new Date();
            
            switch (period) {
                case '7d':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(now.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(now.getDate() - 90);
                    break;
                case '1y':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }
            
            query = query.gte('created_at', startDate.toISOString());
        }

        // Recherche
        if (search) {
            query = query.or(`
                numero_commande.ilike.%${search}%,
                users.nom.ilike.%${search}%,
                users.prenom.ilike.%${search}%,
                users.email.ilike.%${search}%
            `);
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: orders, error: ordersError, count } = await query;

        if (ordersError) {
            console.error('Erreur Supabase:', ordersError);
            return NextResponse.json({ error: 'Erreur lors de la récupération des commandes' }, { status: 500 });
        }

        // Récupérer les informations Stripe pour chaque paiement
        const paymentsWithStripe = await Promise.all(
            (orders || []).map(async (order) => {
                try {
                    if (order.stripe_payment_intent_id) {
                        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
                        
                        return {
                            id: order.id,
                            stripe_payment_intent_id: order.stripe_payment_intent_id,
                            amount: order.montant_total,
                            currency: 'eur',
                            status: paymentIntent.status === 'succeeded' ? 'succeeded' : 
                                   paymentIntent.status === 'processing' ? 'pending' : 
                                   paymentIntent.status === 'requires_payment_method' ? 'failed' : 'canceled',
                            payment_method: paymentIntent.payment_method_types?.[0] || 'unknown',
                            customer_email: order.users?.email || '',
                            customer_name: `${order.users?.prenom || ''} ${order.users?.nom || ''}`.trim(),
                            order_id: order.id,
                            order_number: order.numero_commande,
                            created_at: order.created_at,
                            updated_at: order.updated_at,
                            metadata: {
                                order_id: order.id,
                                customer_id: order.user_id
                            }
                        };
                    }
                    return null;
                } catch (stripeError) {
                    console.error('Erreur Stripe pour le paiement:', order.stripe_payment_intent_id, stripeError);
                    return null;
                }
            })
        );

        const validPayments = paymentsWithStripe.filter(p => p !== null);

        return NextResponse.json({
            payments: validPayments,
            pagination: {
                page,
                limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error) {
        console.error('Erreur API payments:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}
