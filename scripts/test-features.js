#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAnalytics() {
  log('\n🔍 Test du système d\'Analytics...', 'blue');
  
  try {
    // Test de l'endpoint analytics/events
    const eventData = {
      event_type: 'page_view',
      page_url: '/test',
      user_agent: 'Test Bot',
      ip_address: '127.0.0.1'
    };
    
    const eventResponse = await makeRequest('/api/analytics/events', 'POST', eventData);
    if (eventResponse.status === 200 || eventResponse.status === 201) {
      log('✅ Analytics events endpoint fonctionne', 'green');
    } else {
      log(`❌ Analytics events endpoint échoué: ${eventResponse.status}`, 'red');
    }

    // Test de l'endpoint analytics/dashboard
    const dashboardResponse = await makeRequest('/api/analytics/dashboard');
    if (dashboardResponse.status === 200) {
      log('✅ Analytics dashboard endpoint fonctionne', 'green');
    } else {
      log(`❌ Analytics dashboard endpoint échoué: ${dashboardResponse.status}`, 'red');
    }

  } catch (error) {
    log(`❌ Erreur lors du test analytics: ${error.message}`, 'red');
  }
}

async function testStockManagement() {
  log('\n📦 Test de la gestion des stocks...', 'blue');
  
  try {
    // Test de l'endpoint stock/movements
    const movementsResponse = await makeRequest('/api/admin/stock/movements');
    if (movementsResponse.status === 200 || movementsResponse.status === 401) {
      log('✅ Stock movements endpoint accessible', 'green');
    } else {
      log(`❌ Stock movements endpoint échoué: ${movementsResponse.status}`, 'red');
    }

    // Test de l'endpoint stock/alerts
    const alertsResponse = await makeRequest('/api/admin/stock/alerts');
    if (alertsResponse.status === 200 || alertsResponse.status === 401) {
      log('✅ Stock alerts endpoint accessible', 'green');
    } else {
      log(`❌ Stock alerts endpoint échoué: ${alertsResponse.status}`, 'red');
    }

  } catch (error) {
    log(`❌ Erreur lors du test stock: ${error.message}`, 'red');
  }
}

async function testReviews() {
  log('\n⭐ Test du système d\'avis...', 'blue');
  
  try {
    // Test de l'endpoint reviews
    const reviewsResponse = await makeRequest('/api/reviews');
    if (reviewsResponse.status === 200) {
      log('✅ Reviews endpoint fonctionne', 'green');
    } else {
      log(`❌ Reviews endpoint échoué: ${reviewsResponse.status}`, 'red');
    }

  } catch (error) {
    log(`❌ Erreur lors du test reviews: ${error.message}`, 'red');
  }
}

async function testSEO() {
  log('\n🔍 Test du SEO...', 'blue');
  
  try {
    // Test du sitemap
    const sitemapResponse = await makeRequest('/sitemap.xml');
    if (sitemapResponse.status === 200) {
      log('✅ Sitemap accessible', 'green');
    } else {
      log(`❌ Sitemap échoué: ${sitemapResponse.status}`, 'red');
    }

    // Test du robots.txt
    const robotsResponse = await makeRequest('/robots.txt');
    if (robotsResponse.status === 200) {
      log('✅ Robots.txt accessible', 'green');
    } else {
      log(`❌ Robots.txt échoué: ${robotsResponse.status}`, 'red');
    }

  } catch (error) {
    log(`❌ Erreur lors du test SEO: ${error.message}`, 'red');
  }
}

async function testPages() {
  log('\n📄 Test des pages principales...', 'blue');
  
  const pages = [
    '/',
    '/collections',
    '/contact',
    '/faq',
    '/mentions-legales'
  ];

  for (const page of pages) {
    try {
      const response = await makeRequest(page);
      if (response.status === 200) {
        log(`✅ Page ${page} accessible`, 'green');
      } else {
        log(`❌ Page ${page} échoué: ${response.status}`, 'red');
      }
    } catch (error) {
      log(`❌ Erreur page ${page}: ${error.message}`, 'red');
    }
  }
}

async function runAllTests() {
  log('🚀 Démarrage des tests des fonctionnalités Phase 1...', 'yellow');
  
  await testPages();
  await testAnalytics();
  await testStockManagement();
  await testReviews();
  await testSEO();
  
  log('\n✨ Tests terminés!', 'yellow');
  log('📋 Consultez le fichier TEST_PLAN.md pour des tests manuels détaillés.', 'blue');
}

// Vérifier si le serveur est démarré
async function checkServer() {
  try {
    const response = await makeRequest('/');
    if (response.status === 200) {
      log('✅ Serveur démarré et accessible', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Serveur non accessible. Assurez-vous que `npm run dev` est démarré.', 'red');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  } else {
    process.exit(1);
  }
}

main().catch(console.error); 