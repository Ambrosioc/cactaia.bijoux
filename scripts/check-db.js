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

async function checkTables() {
  log('\n🔍 Vérification des tables...', 'blue');
  
  const tables = [
    'analytics_events',
    'stock_movements', 
    'stock_alerts',
    'reviews',
    'review_votes',
    'products',
    'users'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        log(`❌ Table ${table}: ${error.message}`, 'red');
      } else {
        log(`✅ Table ${table}: OK`, 'green');
      }
    } catch (err) {
      log(`❌ Table ${table}: ${err.message}`, 'red');
    }
  }
}

async function checkAnalyticsEvents() {
  log('\n📊 Test insertion analytics_events...', 'blue');
  
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'test',
        page_url: '/test',
        user_agent: 'Test Bot',
        ip_address: '127.0.0.1',
        metadata: {}
      })
      .select();

    if (error) {
      log(`❌ Erreur insertion: ${error.message}`, 'red');
      log(`Détails: ${JSON.stringify(error)}`, 'red');
    } else {
      log(`✅ Insertion réussie: ${data.length} enregistrement(s)`, 'green');
    }
  } catch (err) {
    log(`❌ Exception: ${err.message}`, 'red');
  }
}

async function checkStockMovements() {
  log('\n📦 Test insertion stock_movements...', 'blue');
  
  try {
    // D'abord, vérifier s'il y a des produits
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (productsError || !products || products.length === 0) {
      log('❌ Aucun produit trouvé pour tester stock_movements', 'red');
      return;
    }

    const productId = products[0].id;

    const { data, error } = await supabase
      .from('stock_movements')
      .insert({
        product_id: productId,
        movement_type: 'in',
        quantity: 10,
        previous_quantity: 0,
        new_quantity: 10,
        reason: 'Test',
        user_id: '00000000-0000-0000-0000-000000000000'
      })
      .select();

    if (error) {
      log(`❌ Erreur insertion: ${error.message}`, 'red');
      log(`Détails: ${JSON.stringify(error)}`, 'red');
    } else {
      log(`✅ Insertion réussie: ${data.length} enregistrement(s)`, 'green');
    }
  } catch (err) {
    log(`❌ Exception: ${err.message}`, 'red');
  }
}

async function checkReviews() {
  log('\n⭐ Test insertion reviews...', 'blue');
  
  try {
    // D'abord, vérifier s'il y a des produits
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (productsError || !products || products.length === 0) {
      log('❌ Aucun produit trouvé pour tester reviews', 'red');
      return;
    }

    const productId = products[0].id;

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: '00000000-0000-0000-0000-000000000000',
        rating: 5,
        content: 'Test review',
        verified_purchase: false,
        status: 'pending'
      })
      .select();

    if (error) {
      log(`❌ Erreur insertion: ${error.message}`, 'red');
      log(`Détails: ${JSON.stringify(error)}`, 'red');
    } else {
      log(`✅ Insertion réussie: ${data.length} enregistrement(s)`, 'green');
    }
  } catch (err) {
    log(`❌ Exception: ${err.message}`, 'red');
  }
}

async function main() {
  log('🔧 Vérification de la base de données...', 'yellow');
  
  await checkTables();
  await checkAnalyticsEvents();
  await checkStockMovements();
  await checkReviews();
  
  log('\n✨ Vérification terminée!', 'yellow');
}

main().catch(console.error); 