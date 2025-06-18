import { stripe, WEBHOOK_EVENTS } from '@/lib/stripe/config';
import { createServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
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
  } catch (error) {
    console.error('Erreur de vérification webhook:', error);
    return NextResponse.json(
      { error: 'Signature invalide' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  try {
    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED: {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_status === 'paid') {
          const orderId = session.metadata?.order_id;
          
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

            const { error } = await supabase
              .from('commandes')
              .update(updateData)
              .eq('id', orderId);

            if (error) {
              console.error('Erreur mise à jour commande:', error);
            } else {
              console.log(`Commande ${orderId} marquée comme payée`);
              
              // Optionnel: Décrémenter le stock des produits
              const { data: order } = await supabase
                .from('commandes')
                .select('produits')
                .eq('id', orderId)
                .single();

              if (order && Array.isArray(order.produits)) {
                for (const product of order.produits as any[]) {
                  await supabase
                    .from('produits')
                    .update({
                      stock: product.stock - product.quantite
                    })
                    .eq('id', product.product_id);
                }
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
        
        // Just update the invoice URL if available
        if (invoice.invoice_pdf) {
          // You might need to find the order differently
          // For now, this case can be simplified or removed
          console.log('Invoice payment succeeded, PDF available:', invoice.invoice_pdf);
        }
        break;
      }

      default:
        console.log(`Événement webhook non géré: ${event.type}`);
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