import { config } from 'dotenv';
import { sendNewsletterWelcomeEmail } from '../lib/email/sendNewsletterWelcomeEmail.js';

// Charger les variables d'environnement
config({ path: '.env.local' });

async function testMailjet() {
  console.log('🧪 Test de configuration Mailjet...');
  
  // Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement :');
  console.log('MAILJET_API_KEY:', process.env.MAILJET_API_KEY ? '✅ Configurée' : '❌ Manquante');
  console.log('MAILJET_API_SECRET:', process.env.MAILJET_API_SECRET ? '✅ Configurée' : '❌ Manquante');
  console.log('MAILJET_FROM_EMAIL:', process.env.MAILJET_FROM_EMAIL || '❌ Non configurée');
  
  // Test avec un email fictif
  const testSubscriber = {
    prenom: 'Test',
    nom: 'Utilisateur',
    email: 'test@example.com', // Remplace par ton email pour tester
    code_reduction: 'TEST123',
    date_inscription: new Date().toISOString()
  };
  
  try {
    console.log('\n📧 Envoi d\'un email de test...');
    const result = await sendNewsletterWelcomeEmail(testSubscriber);
    console.log('✅ Email envoyé avec succès !');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi :', error.message);
    console.error('Détails complets :', error);
  }
}

testMailjet(); 