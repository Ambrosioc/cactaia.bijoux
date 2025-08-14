import { createEmailHTML } from './baseTemplate';

interface WelcomeTemplateProps {
    customerName: string;
    collectionsUrl: string;
}

export function renderWelcomeEmail(props: WelcomeTemplateProps): string {
    const { customerName, collectionsUrl } = props;
    const currentYear = new Date().getFullYear();

    const content = `
        <h1 style="font-size: 24px; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; color: #333333;">Bienvenue chez Cactaia.Bijoux ✨</h1>

        <p>Bonjour ${customerName},</p>

        <p>Nous sommes ravis de vous accueillir dans la communauté Cactaia.Bijoux ! Votre compte a été créé avec succès.</p>

        <div style="margin: 30px 0; text-align: center; padding: 20px; background-color: #f5f5f4; border-radius: 8px;">
            <h2 style="color: #4A7C59; margin: 0;">🌵✨</h2>
            <p style="margin: 10px 0 0 0; font-style: italic; color: #666;">Bienvenue dans notre univers de bijoux écoresponsables</p>
        </div>

        <p>Chez Cactaia.Bijoux, nous créons des bijoux écoresponsables, mixtes et élégants avec des valeurs de durabilité, simplicité et force symbolique.</p>

        <p>Découvrez dès maintenant notre collection de bijoux inspirés par la nature :</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${collectionsUrl}" style="display: inline-block; background-color: #4A7C59; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">
                Découvrir nos collections
            </a>
        </div>

        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Votre compte vous permet de :</p>
            <ul style="padding-left: 20px; margin: 0;">
                <li>Suivre vos commandes</li>
                <li>Gérer vos adresses de livraison</li>
                <li>Accéder à vos factures</li>
                <li>Créer une liste de souhaits</li>
            </ul>
        </div>

        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f4; border-radius: 4px; font-size: 12px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Informations RGPD :</p>
            <p style="margin: 0;">
                Conformément au Règlement Général sur la Protection des Données (RGPD), nous vous informons que vos données personnelles sont traitées dans le but de gérer votre compte client et vos commandes.
                Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données.
                Pour en savoir plus, consultez notre <a href="https://cactaiabijoux.fr/politique-de-confidentialite">politique de confidentialité</a>.
            </p>
        </div>

        <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:contact@cactaiabijoux.fr">contact@cactaiabijoux.fr</a>.</p>

        <p>À très bientôt sur notre site,<br />L'équipe Cactaia.Bijoux</p>
    `;

    return createEmailHTML(content, 'Bienvenue chez Cactaia.Bijoux');
}