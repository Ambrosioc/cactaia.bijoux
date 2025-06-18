import { NextRequest, NextResponse } from 'next/server';
import Mailjet from 'node-mailjet';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'adresse email de test depuis les query params
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email') || 'adresse@email.com';
    
    // Initialiser Mailjet directement
    const mailjet = Mailjet.apiConnect(
      process.env.MAILJET_API_KEY || '',
      process.env.MAILJET_API_SECRET || ''
    );
    
    // Tester l'envoi d'un email simple
    const response = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL || 'contact@cactaiabijoux.fr',
            Name: process.env.MAILJET_SENDER_NAME || 'Cactaia.Bijoux',
          },
          To: [
            {
              Email: testEmail,
              Name: 'Utilisateur Test',
            },
          ],
          Subject: 'Test simple Mailjet',
          TextPart: 'Ceci est un test simple pour Mailjet.',
          HTMLPart: '<h3>Test simple Mailjet</h3><p>Si vous recevez cet email, la configuration Mailjet fonctionne correctement.</p>',
          CustomID: `simple-test-${Date.now()}`,
        },
      ],
    });
    
    return NextResponse.json({
      success: true,
      messageId: (response.body as any).Messages?.[0]?.To?.[0]?.MessageID,
      response: response.body
    });
  } catch (error: any) {
    console.error('Erreur lors du test Mailjet:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du test Mailjet',
        message: error.message,
        statusCode: error.statusCode,
        errorInfo: error.ErrorMessage || error.errorMessage
      },
      { status: 500 }
    );
  }
}