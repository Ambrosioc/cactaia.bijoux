import { createEmailHTML } from './baseTemplate';

interface NewsletterWelcomeTemplateProps {
    customerName: string;
    collectionsUrl: string;
    subscriptionDate: string;
}

export function renderNewsletterWelcomeEmail(props: NewsletterWelcomeTemplateProps): string {
    const { customerName, collectionsUrl, subscriptionDate } = props;
    const currentYear = new Date().getFullYear();

    const content = `
        <h1 style="font-size: 24px; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; color: #333333;">Bienvenue dans la famille Cactaia ! 💌</h1>

        <p>Bonjour ${customerName},</p>

        <p>Nous sommes ravis de vous accueillir dans notre communauté ! Votre inscription à notre newsletter a été confirmée le ${subscriptionDate}.</p>

        <div style="margin: 30px 0; text-align: center;">
            <img
                src="https://images.pexels.com/photos/5370795/pexels-photo-5370795.jpeg"
                alt="Bijoux Cactaia"
                style="max-width: 100%; height: auto; border-radius: 8px; max-height: 200px; object-fit: cover;"
            />
        </div>

        <div style="margin: 30px 0; padding: 25px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #111827; font-family: 'Playfair Display', Georgia, serif;">Merci pour votre inscription</h3>
            <p style="margin: 0; color: #374151;">Vous recevrez nos nouveautés, coulisses d'atelier et offres exclusives directement par email.</p>
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