import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15',
});

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        
        // Vérifier l'authentification admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Vérifier le rôle admin
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role, active_role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Erreur lors de la récupération du profil:', profileError);
            return NextResponse.json({ error: 'Erreur de profil utilisateur' }, { status: 500 });
        }

        if (!profile || profile.active_role !== 'admin') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }

        // Récupérer les paramètres de requête
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const period = searchParams.get('period');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');
        const offset = (page - 1) * limit;

        console.log('🔍 Paramètres de recherche:', { status, period, search, page, limit });

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
            // Mapper les statuts de paiement vers les statuts de commande
            let commandeStatus = status;
            switch (status) {
                case 'succeeded':
                    commandeStatus = 'payee';
                    break;
                case 'pending':
                    commandeStatus = 'en_attente';
                    break;
                case 'failed':
                    commandeStatus = 'echouee';
                    break;
                case 'canceled':
                    commandeStatus = 'annulee';
                    break;
            }
            query = query.eq('statut', commandeStatus);
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

        console.log('📊 Exécution de la requête Supabase...');
        const { data: orders, error: ordersError, count } = await query;

        if (ordersError) {
            console.error('❌ Erreur Supabase:', ordersError);
            return NextResponse.json({ 
                error: 'Erreur lors de la récupération des commandes',
                details: ordersError.message 
            }, { status: 500 });
        }

        console.log(`✅ ${orders?.length || 0} commandes récupérées`);

        // Si aucune commande trouvée, retourner un tableau vide
        if (!orders || orders.length === 0) {
            return NextResponse.json({
                payments: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    total_pages: 0
                }
            });
        }

        // Récupérer les informations Stripe pour chaque paiement
        console.log('💳 Récupération des informations Stripe...');
        const paymentsWithStripe = await Promise.all(
            orders.map(async (order) => {
                try {
                    if (order.stripe_payment_intent_id) {
                        // Pour les tests, simuler les données Stripe si l'ID commence par 'pi_test_'
                        if (order.stripe_payment_intent_id.startsWith('pi_test_')) {
                            return {
                                id: order.id,
                                stripe_payment_intent_id: order.stripe_payment_intent_id,
                                amount: order.montant_total,
                                currency: 'eur',
                                status: order.statut === 'payee' ? 'succeeded' : 
                                       order.statut === 'en_attente' ? 'pending' : 
                                       order.statut === 'echouee' ? 'failed' : 'canceled',
                                payment_method: 'card',
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

                        // Vraies données Stripe
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
                    console.error('⚠️ Erreur Stripe pour le paiement:', order.stripe_payment_intent_id, stripeError);
                    // Retourner les données de base même si Stripe échoue
                    return {
                        id: order.id,
                        stripe_payment_intent_id: order.stripe_payment_intent_id,
                        amount: order.montant_total,
                        currency: 'eur',
                        status: order.statut === 'payee' ? 'succeeded' : 
                               order.statut === 'en_attente' ? 'pending' : 
                               order.statut === 'echouee' ? 'failed' : 'canceled',
                        payment_method: 'unknown',
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
            })
        );

        const validPayments = paymentsWithStripe.filter(p => p !== null);
        console.log(`✅ ${validPayments.length} paiements traités avec succès`);

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
        console.error('❌ Erreur API payments:', error);
        return NextResponse.json(
            { 
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
