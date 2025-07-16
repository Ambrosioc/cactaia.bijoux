import type { Order, OrderAddress, OrderProduct, User } from '@/lib/supabase/types';
import { sendEmail } from './config';
import { renderOrderConfirmationEmail } from './templates/orderConfirmationTemplate';

interface SendOrderConfirmationEmailParams {
  order: Order;
  user: User | { email: string; prenom?: string; nom?: string };
  siteUrl: string;
}

export async function sendOrderConfirmationEmail({
  order,
  user,
  siteUrl
}: SendOrderConfirmationEmailParams) {
  try {
    // Préparer les données pour le template
    const orderItems = order.produits as unknown as OrderProduct[];
    const shippingAddress = order.adresse_livraison as unknown as OrderAddress;
    
    const customerName = user.prenom || user.nom 
      ? `${user.prenom || ''} ${user.nom || ''}`.trim()
      : 'Client';
    
    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Date inconnue';
    
    const orderUrl = `${siteUrl}/compte/commandes/${order.id}`;
    
    // Générer le contenu HTML de l'email
    const htmlContent = renderOrderConfirmationEmail({
      orderNumber: order.numero_commande,
      customerName,
      orderDate,
      orderTotal: order.montant_total,
      orderItems,
      orderUrl,
      shippingAddress: {
        fullName: shippingAddress.nom_complet,
        line1: shippingAddress.ligne_1,
        line2: shippingAddress.ligne_2,
        postalCode: shippingAddress.code_postal,
        city: shippingAddress.ville,
        country: shippingAddress.pays
      }
    });
    
    // Envoyer l'email
    const result = await sendEmail({
      subject: `Votre commande ${order.numero_commande} a été confirmée !`,
      htmlContent,
      recipients: [{ Email: user.email, Name: customerName }],
      customId: `order-confirmation-${order.id}`,
      userId: order.user_id,
      orderId: order.id,
      emailType: 'order_confirmation'
    });
    
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation de commande:', error);
    return {
      success: false,
      error
    };
  }
}