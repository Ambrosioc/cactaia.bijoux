#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

function log(message, color = 'reset') {
  const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testReviewsAPI() {
  log('🧪 Test de l\'API Reviews...', 'blue');
  
  try {
    // Test 1: Récupérer les avis
    log('\n1. Test GET /api/reviews', 'yellow');
    const response = await fetch('http://localhost:3000/api/reviews');
    log(`Status: ${response.status}`, response.ok ? 'green' : 'red');
    
    if (response.ok) {
      const data = await response.json();
      log(`✅ ${data.reviews?.length || 0} avis récupérés`, 'green');
    } else {
      const error = await response.text();
      log(`❌ Erreur: ${error}`, 'red');
    }

    // Test 2: Récupérer les avis d'un produit spécifique
    log('\n2. Test GET /api/reviews?product_id=...', 'yellow');
    const { data: products } = await supabase
      .from('produits')
      .select('id')
      .limit(1);

    if (products && products.length > 0) {
      const productId = products[0].id;
      const response2 = await fetch(`http://localhost:3000/api/reviews?product_id=${productId}`);
      log(`Status: ${response2.status}`, response2.ok ? 'green' : 'red');
      
      if (response2.ok) {
        const data = await response2.json();
        log(`✅ ${data.reviews?.length || 0} avis pour le produit`, 'green');
      } else {
        const error = await response2.text();
        log(`❌ Erreur: ${error}`, 'red');
      }
    }

    // Test 3: Vérifier la structure de la table reviews
    log('\n3. Vérification de la structure de la table reviews', 'yellow');
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .limit(1);

    if (error) {
      log(`❌ Erreur Supabase: ${error.message}`, 'red');
    } else {
      log(`✅ Table reviews accessible`, 'green');
      if (reviews && reviews.length > 0) {
        log(`   Colonnes: ${Object.keys(reviews[0]).join(', ')}`, 'reset');
      }
    }

  } catch (error) {
    log(`❌ Exception: ${error.message}`, 'red');
  }
}

async function main() {
  log('🔍 Diagnostic de l\'API Reviews...', 'yellow');
  await testReviewsAPI();
  log('\n✨ Test terminé!', 'green');
}

main().catch(console.error); 