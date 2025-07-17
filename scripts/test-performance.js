#!/usr/bin/env node

/**
 * Script de test des performances et du cache
 * Usage: node scripts/test-performance.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class PerformanceTester {
  constructor() {
    this.results = {
      cache: {},
      api: {},
      images: {},
      overall: {}
    };
  }

  // Test du cache localStorage
  async testLocalStorageCache() {
    console.log('🧪 Test du cache localStorage...');
    
    const testData = {
      products: Array.from({ length: 50 }, (_, i) => ({
        id: i,
        name: `Produit ${i}`,
        price: Math.random() * 100
      })),
      timestamp: Date.now()
    };

    const start = performance.now();
    
    // Simuler la mise en cache (sans localStorage en Node.js)
    const cacheKey = 'test_cache';
    const serializedData = JSON.stringify(testData);
    
    // Simuler la lecture du cache
    const cached = JSON.parse(serializedData);
    
    const end = performance.now();
    const duration = end - start;

    this.results.cache.localStorage = {
      writeTime: duration,
      dataSize: serializedData.length,
      success: cached && cached.products.length === 50
    };

    console.log(`✅ Cache localStorage simulé: ${duration.toFixed(2)}ms (${(serializedData.length / 1024).toFixed(1)}KB)`);
  }

  // Test des API
  async testAPIEndpoints() {
    console.log('🧪 Test des endpoints API...');
    
    const endpoints = [
      '/api/products',
      '/api/wishlist',
      '/api/analytics/dashboard'
    ];

    for (const endpoint of endpoints) {
      try {
        const start = performance.now();
        const response = await this.makeRequest(`http://localhost:3000${endpoint}`);
        const end = performance.now();
        const duration = end - start;

        this.results.api[endpoint] = {
          responseTime: duration,
          status: response.status,
          success: response.status < 400
        };

        console.log(`✅ ${endpoint}: ${duration.toFixed(2)}ms (${response.status})`);
      } catch (error) {
        this.results.api[endpoint] = {
          responseTime: null,
          status: 'error',
          success: false,
          error: error.message
        };
        console.log(`❌ ${endpoint}: Erreur - ${error.message}`);
      }
    }
  }

  // Test des images
  async testImageOptimization() {
    console.log('🧪 Test de l\'optimisation des images...');
    
    const imageUrls = [
      '/images/cactaïa-01.webp',
      '/images/cactaïa-02.webp',
      '/images/cactaïa-01.avif',
      '/images/cactaïa-02.avif',
      '/images/placeholder.jpg'
    ];

    for (const imageUrl of imageUrls) {
      try {
        const start = performance.now();
        const response = await this.makeRequest(`http://localhost:3000${imageUrl}`);
        const end = performance.now();
        const duration = end - start;

        const contentLength = response.headers['content-length'] || 0;

        this.results.images[imageUrl] = {
          loadTime: duration,
          size: parseInt(contentLength),
          success: response.status === 200
        };

        console.log(`✅ ${imageUrl}: ${duration.toFixed(2)}ms (${(contentLength / 1024).toFixed(1)}KB)`);
      } catch (error) {
        this.results.images[imageUrl] = {
          loadTime: null,
          size: 0,
          success: false,
          error: error.message
        };
        console.log(`❌ ${imageUrl}: Erreur - ${error.message}`);
      }
    }
  }

  // Test des performances globales
  async testOverallPerformance() {
    console.log('🧪 Test des performances globales...');
    
    const tests = [
      { name: 'Chargement initial', url: 'http://localhost:3000' },
      { name: 'Page produits', url: 'http://localhost:3000/collections' },
      { name: 'Page catégorie', url: 'http://localhost:3000/categorie/bagues' }
    ];

    for (const test of tests) {
      try {
        const start = performance.now();
        const response = await this.makeRequest(test.url);
        const end = performance.now();
        const duration = end - start;

        this.results.overall[test.name] = {
          loadTime: duration,
          status: response.status,
          success: response.status < 400
        };

        console.log(`✅ ${test.name}: ${duration.toFixed(2)}ms`);
      } catch (error) {
        this.results.overall[test.name] = {
          loadTime: null,
          status: 'error',
          success: false,
          error: error.message
        };
        console.log(`❌ ${test.name}: Erreur - ${error.message}`);
      }
    }
  }

  // Test du service worker
  async testServiceWorker() {
    console.log('🧪 Test du service worker...');
    
    try {
      const response = await this.makeRequest('http://localhost:3000/sw.js');
      
      this.results.serviceWorker = {
        available: response.status === 200,
        size: response.headers['content-length'] || 0
      };

      console.log(`✅ Service Worker: ${response.status === 200 ? 'Disponible' : 'Non disponible'}`);
    } catch (error) {
      this.results.serviceWorker = {
        available: false,
        error: error.message
      };
      console.log(`❌ Service Worker: Erreur - ${error.message}`);
    }
  }

  // Faire une requête HTTP
  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const req = client.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
  }

  // Générer un rapport
  generateReport() {
    console.log('\n📊 RAPPORT DE PERFORMANCE');
    console.log('=' .repeat(50));

    // Cache
    console.log('\n🔧 CACHE:');
    if (this.results.cache.localStorage) {
      const cache = this.results.cache.localStorage;
      console.log(`  localStorage: ${cache.writeTime.toFixed(2)}ms (${(cache.dataSize / 1024).toFixed(1)}KB)`);
    }

    // API
    console.log('\n🌐 API:');
    Object.entries(this.results.api).forEach(([endpoint, result]) => {
      if (result.success) {
        console.log(`  ${endpoint}: ${result.responseTime.toFixed(2)}ms`);
      } else {
        console.log(`  ${endpoint}: ❌ ${result.error || 'Erreur'}`);
      }
    });

    // Images
    console.log('\n🖼️  IMAGES:');
    Object.entries(this.results.images).forEach(([image, result]) => {
      if (result.success) {
        console.log(`  ${image}: ${result.loadTime.toFixed(2)}ms (${(result.size / 1024).toFixed(1)}KB)`);
      } else {
        console.log(`  ${image}: ❌ ${result.error || 'Erreur'}`);
      }
    });

    // Performance globale
    console.log('\n⚡ PERFORMANCE GLOBALE:');
    Object.entries(this.results.overall).forEach(([page, result]) => {
      if (result.success) {
        console.log(`  ${page}: ${result.loadTime.toFixed(2)}ms`);
      } else {
        console.log(`  ${page}: ❌ ${result.error || 'Erreur'}`);
      }
    });

    // Service Worker
    if (this.results.serviceWorker) {
      console.log('\n🔧 SERVICE WORKER:');
      if (this.results.serviceWorker.available) {
        console.log(`  Disponible: Oui (${(this.results.serviceWorker.size / 1024).toFixed(1)}KB)`);
      } else {
        console.log(`  Disponible: Non (${this.results.serviceWorker.error})`);
      }
    }

    // Calculer les moyennes
    this.calculateAverages();
  }

  // Calculer les moyennes
  calculateAverages() {
    console.log('\n📈 MOYENNES:');
    
    const apiTimes = Object.values(this.results.api)
      .filter(r => r.success && r.responseTime)
      .map(r => r.responseTime);
    
    const imageTimes = Object.values(this.results.images)
      .filter(r => r.success && r.loadTime)
      .map(r => r.loadTime);
    
    const pageTimes = Object.values(this.results.overall)
      .filter(r => r.success && r.loadTime)
      .map(r => r.loadTime);

    if (apiTimes.length > 0) {
      const avgApi = apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length;
      console.log(`  API moyenne: ${avgApi.toFixed(2)}ms`);
    }

    if (imageTimes.length > 0) {
      const avgImage = imageTimes.reduce((a, b) => a + b, 0) / imageTimes.length;
      console.log(`  Images moyenne: ${avgImage.toFixed(2)}ms`);
    }

    if (pageTimes.length > 0) {
      const avgPage = pageTimes.reduce((a, b) => a + b, 0) / pageTimes.length;
      console.log(`  Pages moyenne: ${avgPage.toFixed(2)}ms`);
    }
  }

  // Sauvegarder les résultats
  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-test-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'logs', filename);
    
    // Créer le dossier logs s'il n'existe pas
    const logsDir = path.dirname(filepath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Résultats sauvegardés: ${filename}`);
  }

  // Exécuter tous les tests
  async runAllTests() {
    console.log('🚀 Démarrage des tests de performance...\n');
    
    try {
      await this.testLocalStorageCache();
      await this.testAPIEndpoints();
      await this.testImageOptimization();
      await this.testOverallPerformance();
      await this.testServiceWorker();
      
      this.generateReport();
      this.saveResults();
      
      console.log('\n✅ Tests terminés avec succès !');
    } catch (error) {
      console.error('\n❌ Erreur lors des tests:', error.message);
      process.exit(1);
    }
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests();
}

module.exports = PerformanceTester; 