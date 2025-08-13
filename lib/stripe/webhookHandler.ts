import { sendInvoiceEmail, sendOrderConfirmationEmail } from '@/lib/email';
import { stripe, WEBHOOK_EVENTS } from '@/lib/stripe/config';
import { createWebhookClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function handleWebhook(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('Webhook: Signature manquante');
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Erreur de vérification webhook:', error.message);
    return NextResponse.json(
      { error: 'Signature invalide' },
      { status: 400 }
    );
  }

  const supabase = createWebhookClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED: {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_status === 'paid') {
          const orderId = session.metadata?.order_id;
          const promoSummary = {
            total_details: (session.total_details as any) || null,
            discounts: (session.total_details as any)?.amount_discount || 0,
            promotion_codes: (session as any)?.discounts || undefined,
            applyPromoMode: session.metadata?.applyPromoMode,
            promotionCodeId: session.metadata?.promotionCodeId,
          };
          
          if (orderId) {
            // Récupérer la facture si disponible
            let invoiceUrl: string | null = null;
            
            if (session.invoice) {
              try {
                const invoice = await stripe.invoices.retrieve(session.invoice as string);
                invoiceUrl = invoice.invoice_pdf || null;
              } catch (error) {
                console.error('Erreur récupération facture:', error);
              }
            }

            // Mettre à jour la commande
            const updateData: any = {
              statut: 'payee',
              stripe_payment_intent_id: session.payment_intent,
            };

            if (invoiceUrl) {
              updateData.facture_url = invoiceUrl;
            }

            const { data: order, error } = await supabase
              .from('commandes')
              .update(updateData)
              .eq('id', orderId)
              .select('*')
              .single();

            if (error) {
              console.error('Erreur mise à jour commande:', { error, sessionId: session.id, promoSummary });
            } else {
              // Récupérer les données utilisateur séparément
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('id, email, prenom, nom')
                .eq('id', order.user_id)
                .single();
              
              if (userError) {
                console.error('Erreur récupération utilisateur:', userError);
              } else {
                // Envoyer l'email de confirmation
                await sendOrderConfirmationEmail({
                  order,
                  user,
                  siteUrl
                });

                // Envoyer l'email de facture si disponible
                if (invoiceUrl) {
                  await sendInvoiceEmail({
                    order,
                    user,
                    invoiceUrl,
                    siteUrl
                  });
                }
              }
              
              // Optionnel: Décrémenter le stock des produits
              const { data: orderData } = await supabase
                .from('commandes')
                .select('produits')
                .eq('id', orderId)
                .single();

              if (orderData && Array.isArray(orderData.produits)) {
                for (const product of orderData.produits as any[]) {
                  await supabase
                    .from('produits')
                    .update({
                      stock: product.stock - product.quantite
                    })
                    .eq('id', product.product_id);
                }
              }
              // Log en base (optionnel) via analytics_events
              try {
                await supabase.from('analytics_events').insert({
                  event_type: 'checkout.session.completed',
                  user_id: order?.user_id,
                  order_id: orderId,
                  order_total: order?.montant_total,
                  metadata: promoSummary as any,
                });
              } catch (e) {
                console.error('Erreur log analytics checkout:', e);
              }
            }
          }
        }
        break;
      }

      case WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED: {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;
        
        if (orderId) {
          await supabase
            .from('commandes')
            .update({
              statut: 'payee',
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq('id', orderId);
        }
        break;
      }

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED: {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Mettre à jour la commande avec l'URL de la facture si disponible
        if (invoice.invoice_pdf && invoice.metadata?.order_id) {
          const { error } = await supabase
            .from('commandes')
            .update({
              facture_url: invoice.invoice_pdf
            })
            .eq('id', invoice.metadata.order_id);
            
          if (error) {
            console.error('Erreur mise à jour facture commande:', error);
          }
        }
        break;
      }

      case WEBHOOK_EVENTS.INVOICE_PAID: {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Même logique que invoice.payment_succeeded
        if (invoice.invoice_pdf && invoice.metadata?.order_id) {
          const { error } = await supabase
            .from('commandes')
            .update({
              facture_url: invoice.invoice_pdf
            })
            .eq('id', invoice.metadata.order_id);
            
          if (error) {
            console.error('Erreur mise à jour facture commande (invoice.paid):', error);
          }
        }
        // Log discount récurrent
        try {
          await supabase.from('analytics_events').insert({
            event_type: 'invoice.paid',
            order_id: invoice.metadata?.order_id || null,
            order_total: invoice.total ? invoice.total / 100 : null,
            metadata: {
              total_discount_amounts: invoice.total_discount_amounts || [],
              customer_email: (invoice.customer_email as any) || null,
            } as any,
          });
        } catch (e) {
          console.error('Erreur log analytics invoice.paid:', e);
        }
        break;
      }

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_PAID: {
        const invoicePayment = event.data.object as Stripe.Invoice;
        
        // Même logique que les autres événements de facture
        if (invoicePayment.invoice_pdf && invoicePayment.metadata?.order_id) {
          const { error } = await supabase
            .from('commandes')
            .update({
              facture_url: invoicePayment.invoice_pdf
            })
            .eq('id', invoicePayment.metadata.order_id);
            
          if (error) {
            console.error('Erreur mise à jour facture commande (invoice_payment.paid):', error);
          }
        }
        break;
      }

      

      case WEBHOOK_EVENTS.PAYMENT_INTENT_CREATED:
      case WEBHOOK_EVENTS.INVOICE_CREATED:
      case WEBHOOK_EVENTS.INVOICE_FINALIZED:
      case WEBHOOK_EVENTS.CHARGE_SUCCEEDED:
      case WEBHOOK_EVENTS.CHARGE_UPDATED: {
        // Ces événements sont informatifs, pas besoin d'action spécifique
        break;
      }

      default:
        // Événement non géré
        break;
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 500 }
    );
  }
}