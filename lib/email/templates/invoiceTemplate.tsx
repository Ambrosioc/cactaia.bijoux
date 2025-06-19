import { createEmailHTML } from './baseTemplate';

interface InvoiceTemplateProps {
    customerName: string;
    orderNumber: string;
    invoiceUrl: string;
    orderUrl: string;
}

export function renderInvoiceEmail(props: InvoiceTemplateProps): string {
    const { customerName, orderNumber, invoiceUrl, orderUrl } = props;

    const content = `
        <h1 style="font-size: 24px; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; color: #333333;">Votre facture est disponible</h1>

        <p>Bonjour ${customerName},</p>

        <p>Nous vous remercions pour votre commande <strong>${orderNumber}</strong>. Votre facture est maintenant disponible.</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${invoiceUrl}" class="button" style="background-color: #4A7C59;">
                Télécharger ma facture
            </a>
        </div>

        <p>Si le bouton ci-dessus ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :</p>
        <p style="word-break: break-all; font-size: 14px; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
            ${invoiceUrl}
        </p>

        <p>Vous pouvez également retrouver cette facture à tout moment dans votre espace client :</p>

        <div style="text-align: center; margin: 20px 0;">
            <a href="${orderUrl}" style="color: #4A7C59; text-decoration: underline;">
                Accéder à ma commande
            </a>
        </div>

        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px;">
                <strong>Note :</strong> Cette facture est un document officiel à conserver. Elle peut vous être utile pour votre comptabilité ou en cas de retour produit.
            </p>
        </div>

        <p>Si vous avez des questions concernant votre facture, n'hésitez pas à nous contacter à <a href="mailto:contact@cactaiabijoux.fr">contact@cactaiabijoux.fr</a>.</p>

        <p>Merci pour votre confiance,<br />L'équipe Cactaia.Bijoux</p>
    `;

    return createEmailHTML(content, `Votre facture pour la commande ${orderNumber}`);
}