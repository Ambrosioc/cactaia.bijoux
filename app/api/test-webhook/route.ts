import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Créer un événement de test mock (Stripe ne permet pas de créer des événements via API)
    const mockEvent = {
      id: 'evt_test_' + Math.random().toString(36).substring(2, 15),
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_' + Math.random().toString(36).substring(2, 15),
          payment_status: 'paid',
          payment_intent: 'pi_test_' + Math.random().toString(36).substring(2, 15),
          metadata: {
            order_id: '00000000-0000-0000-0000-000000000000' // Remplacer par un ID de commande valide pour un test complet
          }
        }
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Événement de test mock créé',
      eventId: mockEvent.id,
      eventType: mockEvent.type,
      note: 'Pour tester un vrai webhook, utilisez "stripe listen --forward-to localhost:3000/api/webhooks/stripe"'
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'événement de test:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de l\'événement de test',
        message: error.message,
        details: error.raw || error
      },
      { status: 500 }
    );
  }
}