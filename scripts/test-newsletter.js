const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase locale
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewsletterAPI() {
  console.log('🧪 Test de l\'API Newsletter\n');

  // Test 1: Inscription valide
  console.log('1️⃣ Test d\'inscription valide...');
  try {
    const response = await fetch('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        civilite: 'Madame',
        prenom: 'Marie',
        nom: 'Dupont',
        date_naissance: '1990-05-15',
        email: 'test.newsletter@example.com'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Inscription réussie !');
      console.log('   Code de réduction:', data.code_reduction);
      console.log('   Message:', data.message);
    } else {
      console.log('❌ Erreur d\'inscription:', data.error);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }

  // Test 2: Tentative de réinscription avec le même email
  console.log('\n2️⃣ Test de réinscription avec le même email...');
  try {
    const response = await fetch('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        civilite: 'Monsieur',
        prenom: 'Jean',
        nom: 'Martin',
        date_naissance: '1985-03-20',
        email: 'test.newsletter@example.com'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Réactivation réussie !');
      console.log('   Code de réduction:', data.code_reduction);
      console.log('   Message:', data.message);
    } else {
      console.log('❌ Erreur attendue:', data.error);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }

  // Test 3: Validation des données
  console.log('\n3️⃣ Test de validation des données...');
  
  // Test email invalide
  try {
    const response = await fetch('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        civilite: 'Madame',
        prenom: 'Test',
        nom: 'Test',
        date_naissance: '1990-05-15',
        email: 'email-invalide'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.log('✅ Validation email invalide:', data.error);
    } else {
      console.log('❌ Validation échouée pour email invalide');
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }

  // Test civilité invalide
  try {
    const response = await fetch('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        civilite: 'Autre',
        prenom: 'Test',
        nom: 'Test',
        date_naissance: '1990-05-15',
        email: 'test.validation@example.com'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.log('✅ Validation civilité invalide:', data.error);
    } else {
      console.log('❌ Validation échouée pour civilité invalide');
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }

  // Test 4: Vérification en base de données
  console.log('\n4️⃣ Vérification en base de données...');
  try {
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', 'test.newsletter@example.com');

    if (error) {
      console.log('❌ Erreur lecture base:', error.message);
    } else {
      console.log('✅ Abonné trouvé en base:');
      console.log('   Nom:', subscribers[0].nom);
      console.log('   Prénom:', subscribers[0].prenom);
      console.log('   Code réduction:', subscribers[0].code_reduction);
      console.log('   Actif:', subscribers[0].est_actif);
      console.log('   Date inscription:', subscribers[0].date_inscription);
    }
  } catch (error) {
    console.log('❌ Erreur base de données:', error.message);
  }

  // Test 5: Test de l'API GET (admin)
  console.log('\n5️⃣ Test de l\'API GET (admin)...');
  try {
    const response = await fetch('http://localhost:3000/api/newsletter');
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ Protection admin fonctionne (401 Unauthorized)');
    } else if (response.ok) {
      console.log('✅ Liste des abonnés récupérée');
      console.log('   Nombre d\'abonnés:', data.subscribers?.length || 0);
    } else {
      console.log('❌ Erreur API GET:', data.error);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }

  console.log('\n🎉 Tests terminés !');
}

// Fonction pour nettoyer les données de test
async function cleanupTestData() {
  console.log('\n🧹 Nettoyage des données de test...');
  
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('email', 'test.newsletter@example.com');

    if (error) {
      console.log('❌ Erreur nettoyage:', error.message);
    } else {
      console.log('✅ Données de test nettoyées');
    }
  } catch (error) {
    console.log('❌ Erreur nettoyage:', error.message);
  }
}

// Exécution des tests
async function runTests() {
  await testNewsletterAPI();
  
  // Optionnel : nettoyer les données de test
  const args = process.argv.slice(2);
  if (args.includes('--cleanup')) {
    await cleanupTestData();
  }
}

runTests().catch(console.error); 