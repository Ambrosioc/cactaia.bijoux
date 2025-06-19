import type { OrderProduct } from '@/lib/supabase/types';
import { formatPrice } from '@/lib/utils';
import { createEmailHTML } from './baseTemplate';

interface OrderConfirmationTemplateProps {
    orderNumber: string;
    customerName: string;
    orderDate: string;
    orderTotal: number;
    orderItems: OrderProduct[];
    orderUrl: string;
    shippingAddress: {
        fullName: string;
        line1: string;
        line2?: string;
        postalCode: string;
        city: string;
        country: string;
    };
}

export function renderOrderConfirmationEmail(props: OrderConfirmationTemplateProps): string {
    const { orderNumber, customerName, orderDate, orderTotal, orderItems, orderUrl, shippingAddress } = props;

    const itemsHtml = orderItems.map((item, index) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">${item.nom}</td>
            <td style="text-align: center; padding: 8px; border-bottom: 1px solid #e5e5e5;">${item.quantite}</td>
            <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e5e5;">${formatPrice(item.prix * item.quantite)}</td>
        </tr>
    `).join('');

    const content = `
        <h1 style="font-size: 24px; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; color: #333333;">Commande confirmée !</h1>

        <p>Bonjour ${customerName},</p>

        <p>Nous vous confirmons que votre commande <strong>${orderNumber}</strong> a bien été reçue et validée. Merci pour votre achat !</p>

        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Récapitulatif de la commande :</p>
            <p style="margin: 0;">Date : ${orderDate}</p>
            <p style="margin: 0;">Numéro de commande : ${orderNumber}</p>
            <p style="margin: 0;">Montant total : ${formatPrice(orderTotal)}</p>
        </div>

        <div style="margin: 20px 0;">
            <p style="font-weight: bold; margin-bottom: 10px;">Articles commandés :</p>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e5e5e5;">Produit</th>
                        <th style="text-align: center; padding: 8px; border-bottom: 1px solid #e5e5e5;">Quantité</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e5e5;">Prix</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="text-align: right; padding: 8px; font-weight: bold;">Total :</td>
                        <td style="text-align: right; padding: 8px; font-weight: bold;">${formatPrice(orderTotal)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Adresse de livraison :</p>
            <p style="margin: 0;">${shippingAddress.fullName}</p>
            <p style="margin: 0;">${shippingAddress.line1}</p>
            ${shippingAddress.line2 ? `<p style="margin: 0;">${shippingAddress.line2}</p>` : ''}
            <p style="margin: 0;">${shippingAddress.postalCode} ${shippingAddress.city}</p>
            <p style="margin: 0;">${shippingAddress.country}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${orderUrl}" class="button">
                Voir les détails de ma commande
            </a>
        </div>

        <p>Votre commande sera préparée avec soin et expédiée dans les plus brefs délais. Vous recevrez un email de confirmation dès que votre colis sera en route.</p>

        <p>Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter à <a href="mailto:contact@cactaiabijoux.fr">contact@cactaiabijoux.fr</a>.</p>

        <p>Merci pour votre confiance,<br />L'équipe Cactaia.Bijoux</p>
    `;

    return createEmailHTML(content, `Votre commande ${orderNumber} a été confirmée`);
}