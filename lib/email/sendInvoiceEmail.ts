import type { Order, User } from '@/lib/supabase/types';
import { sendEmail } from './config';
import { renderInvoiceEmail } from './templates/invoiceTemplate';

interface SendInvoiceEmailParams {
  order: Order;
  user: User | { email: string; prenom?: string; nom?: string };
  invoiceUrl: string;
  siteUrl: string;
}

export async function sendInvoiceEmail({
  order,
  user,
  invoiceUrl,
  siteUrl
}: SendInvoiceEmailParams) {
  try {
    // Préparer les données pour le template
    const customerName = user.prenom || user.nom 
      ? `${user.prenom || ''} ${user.nom || ''}`.trim()
      : 'Client';
    
    const orderUrl = `${siteUrl}/compte/commandes/${order.id}`;
    
    // Générer le contenu HTML de l'email
    const htmlContent = renderInvoiceEmail({
      customerName,
      orderNumber: order.numero_commande,
      invoiceUrl,
      orderUrl
    });
    
    // Envoyer l'email
    return await sendEmail({
      subject: `Votre facture pour la commande ${order.numero_commande}`,
      htmlContent,
      recipients: [{ Email: user.email, Name: customerName }],
      customId: `invoice-${order.id}`,
      userId: order.user_id,
      orderId: order.id,
      emailType: 'invoice'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de facture:', error);
    return {
      success: false,
      error
    };
  }
}