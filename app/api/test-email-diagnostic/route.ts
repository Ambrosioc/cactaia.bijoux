import { DEFAULT_SENDER, mailjet } from '@/lib/email/config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'adresse email de test depuis les query params
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email') || 'adresse@email.com';
    
    // Afficher les informations de configuration
    const configInfo = {
      apiKeyExists: !!process.env.MAILJET_API_KEY,
      apiSecretExists: !!process.env.MAILJET_API_SECRET,
      senderEmail: process.env.MAILJET_SENDER_EMAIL,
      senderName: process.env.MAILJET_SENDER_NAME,
      testRecipient: testEmail
    };
    
    // Tester l'envoi d'un email simple
    const response = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: DEFAULT_SENDER,
          To: [
            {
              Email: testEmail,
              Name: 'Utilisateur Test',
            },
          ],
          Subject: 'Test de diagnostic Mailjet',
          TextPart: 'Ceci est un test de diagnostic pour Mailjet.',
          HTMLPart: `
            <h3>Test de diagnostic Mailjet</h3>
            <p>Si vous recevez cet email, la configuration Mailjet fonctionne correctement.</p>
            <p>Date et heure du test: ${new Date().toLocaleString('fr-FR')}</p>
          `,
          CustomID: `diagnostic-test-${Date.now()}`,
        },
      ],
    });
    
    return NextResponse.json({
      success: true,
      config: configInfo,
      messageId: (response.body as any).Messages?.[0]?.To?.[0]?.MessageID,
      response: response.body
    });
  } catch (error: any) {
    console.error('Erreur lors du test Mailjet:', error);
    
    // Construire une réponse détaillée pour le diagnostic
    const errorDetails = {
      message: error.message,
      statusCode: error.statusCode,
      errorInfo: error.ErrorMessage || error.errorMessage,
      stack: error.stack
    };
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors du test Mailjet',
        details: errorDetails,
        config: {
          apiKeyExists: !!process.env.MAILJET_API_KEY,
          apiSecretExists: !!process.env.MAILJET_API_SECRET,
          senderEmail: process.env.MAILJET_SENDER_EMAIL,
          senderName: process.env.MAILJET_SENDER_NAME
        }
      },
      { status: 500 }
    );
  }
}