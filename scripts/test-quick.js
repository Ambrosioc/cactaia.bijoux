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

async function testProduits() {
  log('\n🛍️ Test des produits...', 'blue');
  
  const { data: produits, error } = await supabase
    .from('produits')
    .select('*')
    .eq('est_actif', true);
  
  if (error) {
    log(`❌ Erreur récupération produits: ${error.message}`, 'red');
    return;
  }
  
  log(`✅ ${produits.length} produits trouvés`, 'green');
  produits.forEach(p => {
    log(`   - ${p.nom} (${p.prix}€, stock: ${p.stock})`, 'reset');
  });
}

async function testAnalytics() {
  log('\n📊 Test des analytics...', 'blue');
  
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('*');
  
  if (error) {
    log(`❌ Erreur récupération analytics: ${error.message}`, 'red');
    return;
  }
  
  log(`✅ ${events.length} événements analytics trouvés`, 'green');
  
  // Grouper par type d'événement
  const eventTypes = {};
  events.forEach(e => {
    eventTypes[e.event_type] = (eventTypes[e.event_type] || 0) + 1;
  });
  
  Object.entries(eventTypes).forEach(([type, count]) => {
    log(`   - ${type}: ${count} événements`, 'reset');
  });
}

async function testStockMovements() {
  log('\n📦 Test des mouvements de stock...', 'blue');
  
  const { data: movements, error } = await supabase
    .from('stock_movements')
    .select('*');
  
  if (error) {
    log(`❌ Erreur récupération mouvements: ${error.message}`, 'red');
    return;
  }
  
  log(`✅ ${movements.length} mouvements de stock trouvés`, 'green');
  
  // Grouper par type de mouvement
  const movementTypes = {};
  movements.forEach(m => {
    movementTypes[m.movement_type] = (movementTypes[m.movement_type] || 0) + 1;
  });
  
  Object.entries(movementTypes).forEach(([type, count]) => {
    log(`   - ${type}: ${count} mouvements`, 'reset');
  });
}

async function testReviews() {
  log('\n⭐ Test des avis...', 'blue');
  
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*');
  
  if (error) {
    log(`❌ Erreur récupération avis: ${error.message}`, 'red');
    return;
  }
  
  log(`✅ ${reviews.length} avis trouvés`, 'green');
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    log(`   - Note moyenne: ${avgRating.toFixed(1)}/5`, 'reset');
  }
}

async function testAddresses() {
  log('\n📍 Test des adresses...', 'blue');
  
  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('*');
  
  if (error) {
    log(`❌ Erreur récupération adresses: ${error.message}`, 'red');
    return;
  }
  
  log(`✅ ${addresses.length} adresses trouvées`, 'green');
  
  addresses.forEach(addr => {
    log(`   - ${addr.nom_complet} (${addr.ville})`, 'reset');
  });
}

async function testCommandes() {
  log('\n📋 Test des commandes...', 'blue');
  
  const { data: commandes, error } = await supabase
    .from('commandes')
    .select('*');
  
  if (error) {
    log(`❌ Erreur récupération commandes: ${error.message}`, 'red');
    return;
  }
  
  log(`✅ ${commandes.length} commandes trouvées`, 'green');
  
  commandes.forEach(cmd => {
    log(`   - ${cmd.numero_commande} (${cmd.montant_total}€, ${cmd.statut})`, 'reset');
  });
}

async function testAPIs() {
  log('\n🔌 Test des APIs...', 'blue');
  
  const apis = [
    { name: 'Analytics Events', url: '/api/admin/analytics/events' },
    { name: 'Analytics Dashboard', url: '/api/admin/analytics/dashboard' },
    { name: 'Stock Movements', url: '/api/admin/stock/movements' },
    { name: 'Stock Alerts', url: '/api/admin/stock/alerts' },
    { name: 'Reviews', url: '/api/reviews' },
    { name: 'Sitemap', url: '/sitemap.xml' },
    { name: 'Robots.txt', url: '/robots.txt' }
  ];
  
  for (const api of apis) {
    try {
      const response = await fetch(`http://localhost:3000${api.url}`);
      if (response.ok) {
        log(`✅ ${api.name}: OK (${response.status})`, 'green');
      } else {
        log(`⚠️ ${api.name}: ${response.status}`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${api.name}: Erreur de connexion`, 'red');
    }
  }
}

async function main() {
  log('🧪 Test rapide des fonctionnalités...', 'yellow');
  
  try {
    await testProduits();
    await testAnalytics();
    await testStockMovements();
    await testReviews();
    await testAddresses();
    await testCommandes();
    await testAPIs();
    
    log('\n✨ Tests terminés!', 'green');
    log('📋 Vérifiez les résultats ci-dessus.', 'blue');
    
  } catch (error) {
    log(`❌ Erreur lors des tests: ${error.message}`, 'red');
  }
}

main().catch(console.error); 