import Mailjet from 'node-mailjet';
import { logEmailToSupabase } from './logEmailToSupabase';

// Vérification des variables d'environnement
if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET) {
  console.error('Les clés API Mailjet ne sont pas définies dans les variables d\'environnement');
}

if (!process.env.MAILJET_SENDER_EMAIL || !process.env.MAILJET_SENDER_NAME) {
  console.error('Les informations d\'expéditeur Mailjet ne sont pas définies dans les variables d\'environnement');
}

// Configuration de l'expéditeur par défaut
export const DEFAULT_SENDER = {
  Email: process.env.MAILJET_SENDER_EMAIL || 'contact@cactaiabijoux.fr',
  Name: process.env.MAILJET_SENDER_NAME || 'Cactaia.Bijoux'
};

// Création du client Mailjet
export const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY || '',
  process.env.MAILJET_API_SECRET || ''
);

// Types pour les emails
export interface EmailRecipient {
  Email: string;
  Name?: string;
}

export interface EmailAttachment {
  ContentType: string;
  Filename: string;
  Base64Content: string;
}

export interface EmailOptions {
  subject: string;
  htmlContent: string;
  textContent?: string;
  recipients: EmailRecipient[];
  attachments?: EmailAttachment[];
  variables?: Record<string, any>;
  templateId?: number;
  customId?: string;
  userId: string;
  orderId?: string;
  emailType: string;
}

// Fonction utilitaire pour envoyer un email
export async function sendEmail(options: EmailOptions) {
  const { 
    subject, 
    htmlContent, 
    textContent, 
    recipients, 
    attachments, 
    variables, 
    templateId, 
    customId,
    userId,
    orderId,
    emailType
  } = options;

  try {
    // Vérifier si l'email a déjà été envoyé avec succès
    if (orderId && emailType) {
      try {
        const logCheck = await logEmailToSupabase({
          userId,
          orderId,
          emailType,
          recipient: recipients[0].Email,
          subject,
          success: false,
          details: { checkOnly: true }
        });
        
        if (logCheck.alreadyLogged) {
          return {
            success: true,
            alreadySent: true,
            messageId: 'previously-sent'
          };
        }
      } catch (logError) {
        // On continue même si la vérification échoue
      }
    }

    // Construction de la requête Mailjet
    const data = {
      Messages: [
        {
          From: DEFAULT_SENDER,
          To: recipients,
          Subject: subject,
          TextPart: textContent || '',
          HTMLPart: htmlContent,
          CustomID: customId || `email-${Date.now()}`,
          ...(attachments && attachments.length > 0 && { Attachments: attachments }),
          ...(variables && Object.keys(variables).length > 0 && { Variables: variables }),
          ...(templateId && { TemplateID: templateId, TemplateLanguage: true })
        }
      ]
    };

    // Envoi de l'email via Mailjet
    const result = await mailjet.post('send', { version: 'v3.1' }).request(data);
    
    // Enregistrer le succès dans les logs
    try {
      await logEmailToSupabase({
        userId,
        orderId,
        emailType,
        recipient: recipients[0].Email,
        subject,
        success: true,
        messageId: (result.body as any).Messages?.[0]?.To?.[0]?.MessageID,
        details: { response: result.body }
      });
    } catch (logError) {
      // On continue même si le log échoue
    }
    
    return {
      success: true,
      messageId: (result.body as any).Messages?.[0]?.To?.[0]?.MessageID,
      response: result.body
    };
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    
    // Enregistrer l'échec dans les logs
    try {
      await logEmailToSupabase({
        userId,
        orderId,
        emailType,
        recipient: recipients[0].Email,
        subject,
        success: false,
        error: {
          message: error.message,
          statusCode: error.statusCode,
          details: error.ErrorMessage || error.errorMessage
        },
        details: { error }
      });
    } catch (logError) {
      // On continue même si le log échoue
    }
    
    return {
      success: false,
      error
    };
  }
}

// Fonction pour logger les emails envoyés (pour compatibilité)
export async function logEmailSent(userId: string, emailType: string, success: boolean, details: any) {
  // Cette fonction est maintenant remplacée par logEmailToSupabase
}