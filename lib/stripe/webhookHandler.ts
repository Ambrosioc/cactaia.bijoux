import { NotificationService } from '@/lib/notifications/notification-service';
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from './config';

export async function handleStripeWebhook(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        console.error('❌ Signature Stripe manquante');
        return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
    }

    let event;

    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('❌ STRIPE_WEBHOOK_SECRET manquant');
            return NextResponse.json({ error: 'Configuration webhook manquante' }, { status: 500 });
        }

        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('❌ Erreur de vérification de signature:', err);
        return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
    }

    console.log('🔔 Webhook Stripe reçu:', event.type);

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;

            case 'payment_intent.processing':
                await handlePaymentIntentProcessing(event.data.object);
                break;

            case 'charge.refunded':
                await handleChargeRefunded(event.data.object);
                break;

            case 'charge.refund.updated':
                await handleChargeRefundUpdated(event.data.object);
                break;

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object);
                break;

            default:
                console.log(`ℹ️ Événement non géré: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('❌ Erreur lors du traitement du webhook:', error);
        return NextResponse.json(
            { error: 'Erreur lors du traitement' },
            { status: 500 }
        );
    }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
    console.log('✅ Paiement réussi:', paymentIntent.id);
    
    try {
        const supabase = await createServerClient();
        
        // Mettre à jour le statut de la commande
        const { error: updateError } = await supabase
            .from('commandes')
            .update({ 
                statut: 'payee',
                updated_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
            console.error('❌ Erreur mise à jour commande:', updateError);
        }

        // Créer une notification
        const amount = paymentIntent.amount;
        const customerEmail = paymentIntent.receipt_email || paymentIntent.customer_details?.email;
        const orderId = paymentIntent.metadata?.order_id || paymentIntent.id;

        await NotificationService.notifyPaymentSuccess(
            orderId,
            amount,
            customerEmail || 'Email non disponible'
        );

    } catch (error) {
        console.error('❌ Erreur handlePaymentIntentSucceeded:', error);
    }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
    console.log('❌ Paiement échoué:', paymentIntent.id);
    
    try {
        const supabase = await createServerClient();
        
        // Mettre à jour le statut de la commande
        const { error: updateError } = await supabase
            .from('commandes')
            .update({ 
                statut: 'echouee',
                updated_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
            console.error('❌ Erreur mise à jour commande:', updateError);
        }

        // Créer une notification
        const amount = paymentIntent.amount;
        const customerEmail = paymentIntent.receipt_email || paymentIntent.customer_details?.email;
        const orderId = paymentIntent.metadata?.order_id || paymentIntent.id;
        const failureReason = paymentIntent.last_payment_error?.message || 'Raison inconnue';

        await NotificationService.notifyPaymentFailed(
            orderId,
            amount,
            customerEmail || 'Email non disponible',
            failureReason
        );

    } catch (error) {
        console.error('❌ Erreur handlePaymentIntentFailed:', error);
    }
}

async function handlePaymentIntentProcessing(paymentIntent: any) {
    console.log('⏳ Paiement en cours:', paymentIntent.id);
    
    try {
        const supabase = await createServerClient();
        
        // Mettre à jour le statut de la commande
        const { error: updateError } = await supabase
            .from('commandes')
            .update({ 
                statut: 'en_attente',
                updated_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
            console.error('❌ Erreur mise à jour commande:', updateError);
        }

        // Créer une notification
        const amount = paymentIntent.amount;
        const customerEmail = paymentIntent.receipt_email || paymentIntent.customer_details?.email;
        const orderId = paymentIntent.metadata?.order_id || paymentIntent.id;

        await NotificationService.notifyPaymentPending(
            orderId,
            amount,
            customerEmail || 'Email non disponible'
        );

    } catch (error) {
        console.error('❌ Erreur handlePaymentIntentProcessing:', error);
    }
}

async function handleChargeRefunded(charge: any) {
    console.log('🔄 Remboursement traité:', charge.id);
    
    try {
        // Créer une notification de remboursement
        const refund = charge.refunds?.data?.[0];
        if (refund) {
            const amount = refund.amount;
            const orderId = charge.metadata?.order_id || charge.id;
            const status = refund.status;

            await NotificationService.notifyRefundProcessed(
                refund.id,
                orderId,
                amount,
                status
            );
        }

    } catch (error) {
        console.error('❌ Erreur handleChargeRefunded:', error);
    }
}

async function handleChargeRefundUpdated(refund: any) {
    console.log('🔄 Mise à jour remboursement:', refund.id);
    
    try {
        // Créer une notification de mise à jour de remboursement
        const amount = refund.amount;
        const orderId = refund.metadata?.order_id || refund.charge;
        const status = refund.status;

        await NotificationService.notifyRefundProcessed(
            refund.id,
            orderId,
            amount,
            status
        );

    } catch (error) {
        console.error('❌ Erreur handleChargeRefundUpdated:', error);
    }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
    console.log('✅ Facture payée:', invoice.id);
    
    try {
        // Créer une notification pour les paiements récurrents
        if (invoice.subscription) {
            const amount = invoice.amount_paid;
            const customerEmail = invoice.customer_email;
            const subscriptionId = invoice.subscription;

            await NotificationService.notifyPaymentSuccess(
                subscriptionId,
                amount,
                customerEmail || 'Email non disponible'
            );
        }

    } catch (error) {
        console.error('❌ Erreur handleInvoicePaymentSucceeded:', error);
    }
}

async function handleInvoicePaymentFailed(invoice: any) {
    console.log('❌ Facture non payée:', invoice.id);
    
    try {
        // Créer une notification pour les échecs de paiement récurrents
        if (invoice.subscription) {
            const amount = invoice.amount_due;
            const customerEmail = invoice.customer_email;
            const subscriptionId = invoice.subscription;
            const failureReason = invoice.last_payment_error?.message || 'Paiement récurrent échoué';

            await NotificationService.notifyPaymentFailed(
                subscriptionId,
                amount,
                customerEmail || 'Email non disponible',
                failureReason
            );
        }

    } catch (error) {
        console.error('❌ Erreur handleInvoicePaymentFailed:', error);
    }
}