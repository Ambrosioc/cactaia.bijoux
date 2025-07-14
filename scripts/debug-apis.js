#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3000';

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
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
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

async function testAnalyticsEvents() {
  log('\n🔍 Test détaillé Analytics Events...', 'blue');
  
  try {
    // Test GET
    const getResponse = await makeRequest('/api/analytics/events');
    log(`GET /api/analytics/events: ${getResponse.status}`, getResponse.status === 200 ? 'green' : 'red');
    if (getResponse.status !== 200) {
      log(`Erreur: ${JSON.stringify(getResponse.data)}`, 'red');
    }

    // Test POST avec données minimales
    const postData = {
      event_type: 'page_view',
      page_url: '/test'
    };
    
    const postResponse = await makeRequest('/api/analytics/events', 'POST', postData);
    log(`POST /api/analytics/events: ${postResponse.status}`, postResponse.status === 201 ? 'green' : 'red');
    if (postResponse.status !== 201) {
      log(`Erreur: ${JSON.stringify(postResponse.data)}`, 'red');
    }

  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

async function testStockMovements() {
  log('\n📦 Test détaillé Stock Movements...', 'blue');
  
  try {
    const response = await makeRequest('/api/admin/stock/movements');
    log(`GET /api/admin/stock/movements: ${response.status}`, response.status === 200 ? 'green' : 'red');
    if (response.status !== 200) {
      log(`Erreur: ${JSON.stringify(response.data)}`, 'red');
    }

  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

async function testStockAlerts() {
  log('\n⚠️ Test détaillé Stock Alerts...', 'blue');
  
  try {
    const response = await makeRequest('/api/admin/stock/alerts');
    log(`GET /api/admin/stock/alerts: ${response.status}`, response.status === 200 ? 'green' : 'red');
    if (response.status !== 200) {
      log(`Erreur: ${JSON.stringify(response.data)}`, 'red');
    }

  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

async function testReviews() {
  log('\n⭐ Test détaillé Reviews...', 'blue');
  
  try {
    const response = await makeRequest('/api/reviews');
    log(`GET /api/reviews: ${response.status}`, response.status === 200 ? 'green' : 'red');
    if (response.status !== 200) {
      log(`Erreur: ${JSON.stringify(response.data)}`, 'red');
    }

  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

async function testRobotsTxt() {
  log('\n🤖 Test détaillé Robots.txt...', 'blue');
  
  try {
    const response = await makeRequest('/robots.txt');
    log(`GET /robots.txt: ${response.status}`, response.status === 200 ? 'green' : 'red');
    if (response.status !== 200) {
      log(`Erreur: ${response.data}`, 'red');
    } else {
      log('Contenu robots.txt:', 'green');
      log(response.data.substring(0, 200) + '...', 'yellow');
    }

  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

async function runDebugTests() {
  log('🔧 Démarrage des tests de debug...', 'yellow');
  
  await testAnalyticsEvents();
  await testStockMovements();
  await testStockAlerts();
  await testReviews();
  await testRobotsTxt();
  
  log('\n✨ Tests de debug terminés!', 'yellow');
}

runDebugTests().catch(console.error); 