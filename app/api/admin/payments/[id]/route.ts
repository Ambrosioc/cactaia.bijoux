import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15',
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const paymentId = params.id;

        // Récupérer la commande avec toutes les informations
        const { data: order, error: orderError } = await supabase
            .from('commandes')
            .select(`
                *,
                users!inner(
                    id,
                    nom,
                    prenom,
                    email,
                    telephone,
                    created_at
                ),
                adresses_livraison(*),
                adresses_facturation(*)
            `)
            .eq('id', paymentId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
        }

        if (!order.stripe_payment_intent_id) {
            return NextResponse.json({ error: 'Aucun paiement Stripe associé à cette commande' }, { status: 404 });
        }

        // Récupérer les informations Stripe
        let stripeData = null;
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
            const customer = paymentIntent.customer ? await stripe.customers.retrieve(paymentIntent.customer as string) : null;
            
            // Récupérer les charges
            const charges = await stripe.charges.list({
                payment_intent: order.stripe_payment_intent_id,
                limit: 10
            });

            // Récupérer les remboursements
            const refunds = await stripe.refunds.list({
                limit: 10
            });

            // Récupérer les détails de la méthode de paiement
            let paymentMethodDetails = null;
            if (paymentIntent.payment_method) {
                try {
                    const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
                    paymentMethodDetails = paymentMethod;
                } catch (pmError) {
                    console.warn('Impossible de récupérer la méthode de paiement:', pmError);
                }
            }

            stripeData = {
                payment_intent: paymentIntent,
                customer: customer,
                payment_method_details: paymentMethodDetails,
                charges: charges.data,
                refunds: refunds.data.filter(refund => 
                    charges.data.some(charge => charge.id === refund.charge)
                )
            };
        } catch (stripeError) {
            console.error('Erreur Stripe:', stripeError);
            return NextResponse.json({ error: 'Erreur lors de la récupération des données Stripe' }, { status: 500 });
        }

        // Récupérer les produits de la commande
        const { data: orderProducts } = await supabase
            .from('commandes_produits')
            .select(`
                *,
                produits(
                    id,
                    nom,
                    prix,
                    variations
                )
            `)
            .eq('commande_id', paymentId);

        // Construire la réponse
        const paymentDetail = {
            id: order.id,
            stripe_payment_intent_id: order.stripe_payment_intent_id,
            amount: order.montant_total,
            currency: 'eur',
            status: stripeData.payment_intent.status === 'succeeded' ? 'succeeded' : 
                   stripeData.payment_intent.status === 'processing' ? 'pending' : 
                   stripeData.payment_intent.status === 'requires_payment_method' ? 'failed' : 'canceled',
            payment_method: stripeData.payment_intent.payment_method_types?.[0] || 'unknown',
            customer_email: order.users?.email || '',
            customer_name: `${order.users?.prenom || ''} ${order.users?.nom || ''}`.trim(),
            order_id: order.id,
            order_number: order.numero_commande,
            created_at: order.created_at,
            updated_at: order.updated_at,
            metadata: {
                order_id: order.id,
                customer_id: order.user_id
            },
            stripe_data: stripeData,
            order_data: {
                id: order.id,
                numero_commande: order.numero_commande,
                statut: order.statut,
                montant_total: order.montant_total,
                produits: orderProducts?.map(op => ({
                    id: op.produit_id,
                    nom: op.produits?.nom || 'Produit inconnu',
                    prix: op.prix_unitaire,
                    quantite: op.quantite,
                    variante: op.variante || 'Standard'
                })) || [],
                adresse_livraison: order.adresses_livraison || {
                    nom: `${order.users?.prenom || ''} ${order.users?.nom || ''}`.trim(),
                    adresse: order.adresse_livraison || '',
                    complement: order.complement_livraison || '',
                    code_postal: order.code_postal_livraison || '',
                    ville: order.ville_livraison || '',
                    pays: order.pays_livraison || 'France'
                },
                adresse_facturation: order.adresses_facturation || {
                    nom: `${order.users?.prenom || ''} ${order.users?.nom || ''}`.trim(),
                    adresse: order.adresse_facturation || '',
                    complement: order.complement_facturation || '',
                    code_postal: order.code_postal_facturation || '',
                    ville: order.ville_facturation || '',
                    pays: order.pays_facturation || 'France'
                },
                created_at: order.created_at,
                updated_at: order.updated_at
            }
        };

        return NextResponse.json({
            payment: paymentDetail
        });

    } catch (error) {
        console.error('Erreur API payment detail:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}
