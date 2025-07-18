import { createEmailHTML } from './baseTemplate';

interface NewsletterWelcomeTemplateProps {
    customerName: string;
    discountCode: string;
    collectionsUrl: string;
    subscriptionDate: string;
}

export function renderNewsletterWelcomeEmail(props: NewsletterWelcomeTemplateProps): string {
    const { customerName, discountCode, collectionsUrl, subscriptionDate } = props;
    const currentYear = new Date().getFullYear();
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');

    const content = `
        <h1 style="font-size: 24px; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; color: #333333;">Bienvenue dans la famille Cactaia ! 🎁</h1>

        <p>Bonjour ${customerName},</p>

        <p>Nous sommes ravis de vous accueillir dans notre communauté ! Votre inscription à notre newsletter a été confirmée le ${subscriptionDate}.</p>

        <div style="margin: 30px 0; text-align: center;">
            <img
                src="https://images.pexels.com/photos/5370795/pexels-photo-5370795.jpeg"
                alt="Bijoux Cactaia"
                style="max-width: 100%; height: auto; border-radius: 8px; max-height: 200px; object-fit: cover;"
            />
        </div>

        <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #92400e; font-family: 'Playfair Display', Georgia, serif;">🎁 Votre cadeau de bienvenue</h3>
            <p style="margin: 0 0 15px 0; color: #92400e;">Pour vous remercier de votre confiance, voici votre code de réduction exclusif :</p>
            <div style="background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: white; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 15px 0; letter-spacing: 2px;">
                ${discountCode}
            </div>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #92400e;">
                <strong>Réduction de 15% sur votre première commande</strong><br />
                Valable jusqu'au ${expiryDate}
            </p>
        </div>

        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Ce qui vous attend :</p>
            <ul style="padding-left: 20px; margin: 0;">
                <li>✨ Nouveautés exclusives en avant-première</li>
                <li>💎 Conseils personnalisés pour vos bijoux</li>
                <li>🎯 Offres spéciales réservées aux abonnés</li>
                <li>🌵 L'histoire derrière chaque création Cactaia</li>
                <li>📱 Conseils d'entretien et de style</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${collectionsUrl}" class="button">
                Découvrir notre collection
            </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Merci de faire partie de notre aventure. Nous avons hâte de partager avec vous 
            notre passion pour les bijoux durables et porteurs de sens.
        </p>

        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f4; border-radius: 4px; font-size: 12px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Informations RGPD :</p>
            <p style="margin: 0;">
                Conformément au Règlement Général sur la Protection des Données (RGPD), nous vous informons que vos données personnelles sont traitées dans le but de vous envoyer notre newsletter.
                Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données.
                Pour en savoir plus, consultez notre <a href="https://cactaiabijoux.fr/politique-de-confidentialite">politique de confidentialité</a>.
            </p>
        </div>

        <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:contact@cactaiabijoux.fr">contact@cactaiabijoux.fr</a>.</p>

        <p>À très bientôt sur notre site,<br />L'équipe Cactaia.Bijoux</p>
    `;

    return createEmailHTML(content, 'Bienvenue dans la famille Cactaia !');
} 