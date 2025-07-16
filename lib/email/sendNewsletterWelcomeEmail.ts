import { sendEmail } from './config';
import { renderNewsletterWelcomeEmail } from './templates/newsletterWelcomeTemplate';

interface NewsletterSubscriber {
  prenom: string;
  nom: string;
  email: string;
  code_reduction: string;
  date_inscription: string;
}

interface SendNewsletterWelcomeEmailParams {
  subscriber: NewsletterSubscriber;
  siteUrl?: string;
}

export async function sendNewsletterWelcomeEmail({
  subscriber,
  siteUrl = 'https://cactaia-bijoux.vercel.app'
}: SendNewsletterWelcomeEmailParams) {
  try {
    // Préparer les données pour le template
    const customerName = `${subscriber.prenom} ${subscriber.nom}`.trim();
    const collectionsUrl = `${siteUrl}/collections`;
    const subscriptionDate = new Date(subscriber.date_inscription).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Générer le contenu HTML de l'email
    const htmlContent = renderNewsletterWelcomeEmail({
      customerName,
      discountCode: subscriber.code_reduction,
      collectionsUrl,
      subscriptionDate
    });
    
    // Envoyer l'email
    return await sendEmail({
      subject: '🎁 Bienvenue dans la famille Cactaia ! Votre code de réduction vous attend',
      htmlContent,
      recipients: [{ Email: subscriber.email, Name: customerName }],
      customId: `newsletter-welcome-${subscriber.email}`,
      userId: 'newsletter', // ID spécial pour les abonnés newsletter
      emailType: 'newsletter-welcome'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue newsletter:', error);
    return {
      success: false,
      error
    };
  }
} 