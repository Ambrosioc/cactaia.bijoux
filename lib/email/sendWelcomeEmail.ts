import type { User } from '@/lib/supabase/types';
import { sendEmail } from './config';
import { renderWelcomeEmail } from './templates/welcomeTemplate';

interface SendWelcomeEmailParams {
  user: User | { id: string; email: string; prenom?: string; nom?: string };
  siteUrl: string;
}

export async function sendWelcomeEmail({
  user,
  siteUrl
}: SendWelcomeEmailParams) {
  try {
    // Préparer les données pour le template
    const customerName = user.prenom || user.nom 
      ? `${user.prenom || ''} ${user.nom || ''}`.trim()
      : 'Client';
    
    const collectionsUrl = `${siteUrl}/collections`;
    
    // Générer le contenu HTML de l'email
    const htmlContent = renderWelcomeEmail({
      customerName,
      collectionsUrl
    });
    
    // Envoyer l'email
    return await sendEmail({
      subject: 'Bienvenue chez Cactaia.Bijoux ✨',
      htmlContent,
      recipients: [{ Email: user.email, Name: customerName }],
      customId: `welcome-${user.id}`,
      userId: user.id,
      emailType: 'welcome'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    return {
      success: false,
      error
    };
  }
}