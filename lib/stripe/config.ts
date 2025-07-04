import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
  appInfo: {
    name: 'Cactaia.Bijoux',
    version: '1.0.0',
  },
});

export const STRIPE_CONFIG = {
  currency: 'eur',
  payment_method_types: ['card'],
  allowed_countries: ['FR', 'BE', 'CH', 'LU'],
  shipping_options: {
    free_shipping_threshold: 50,
    standard_shipping_cost: 4.95,
  },
} as const;

// Configuration pour les webhooks
export const WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_CREATED: 'payment_intent.created',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_PAID: 'invoice_payment.paid',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_FINALIZED: 'invoice.finalized',
  CHARGE_SUCCEEDED: 'charge.succeeded',
  CHARGE_UPDATED: 'charge.updated',
} as const;