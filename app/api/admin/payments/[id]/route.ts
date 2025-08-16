import { createServerClient } from '@/lib/supabase/server';
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

        const paymentId = params.id;

        // Récupérer la commande avec les informations utilisateur et adresses
        const { data: order, error: orderError } = await supabase
            .from('commandes')
            .select(`
                *,
                users!inner(id, nom, prenom, email, telephone, created_at),
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

        // Récupérer les données Stripe
        let stripeData = null;
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
            const customer = paymentIntent.customer ? await stripe.customers.retrieve(paymentIntent.customer as string) : null;
            const charges = await stripe.charges.list({ payment_intent: order.stripe_payment_intent_id, limit: 10 });
            const refunds = await stripe.refunds.list({ limit: 10 });
            
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
            .select(`*, produits(id, nom, prix, variations)`)
            .eq('commande_id', paymentId);

        // Construire l'objet de détail du paiement
        const paymentDetail = {
            id: order.id,
            stripe_payment_intent_id: order.stripe_payment_intent_id,
            amount: order.montant_total,
            currency: 'eur',
            status: order.statut,
            order_number: order.numero_commande,
            created_at: order.created_at,
            updated_at: order.updated_at,
            
            // Informations client
            customer: {
                id: order.user_id,
                name: `${order.users?.prenom || ''} ${order.users?.nom || ''}`.trim(),
                email: order.users?.email,
                phone: order.users?.telephone,
                created_at: order.users?.created_at
            },
            
            // Adresses
            shipping_address: order.adresses_livraison?.[0] || null,
            billing_address: order.adresses_facturation?.[0] || null,
            
            // Produits
            products: orderProducts || [],
            
            // Données Stripe
            stripe: stripeData
        };

        return NextResponse.json({ payment: paymentDetail });

    } catch (error) {
        console.error('Erreur API payment detail:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}
