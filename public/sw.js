const CACHE_NAME = 'cactaia-cache-v1';
const STATIC_CACHE_NAME = 'cactaia-static-v1';
const IMAGE_CACHE_NAME = 'cactaia-images-v1';

// Ressources à mettre en cache immédiatement
const STATIC_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/images/placeholder.jpg'
];

// Extensions d'images à mettre en cache
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];

// Installer le service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache des ressources statiques
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      }),
      // Cache des images
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Image cache ready');
        return cache;
      })
    ])
  );
  
  self.skipWaiting();
});

// Activer le service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ])
  );
});

// Intercepter les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers l'API
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Ignorer les requêtes vers Supabase
  if (url.hostname.includes('supabase')) {
    return;
  }

  // Stratégie pour les images
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Stratégie pour les ressources statiques
  if (isStaticResource(request)) {
    event.respondWith(handleStaticResource(request));
    return;
  }

  // Stratégie pour les pages HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handlePageRequest(request));
    return;
  }

  // Stratégie par défaut : Network First
  event.respondWith(handleDefaultRequest(request));
});

// Vérifier si c'est une requête d'image
function isImageRequest(request) {
  const url = new URL(request.url);
  return IMAGE_EXTENSIONS.some(ext => url.pathname.toLowerCase().includes(ext)) ||
         request.headers.get('accept')?.includes('image/');
}

// Vérifier si c'est une ressource statique
function isStaticResource(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/_next/') ||
         url.pathname.startsWith('/static/') ||
         url.pathname.includes('.css') ||
         url.pathname.includes('.js') ||
         url.pathname.includes('.woff') ||
         url.pathname.includes('.woff2');
}

// Gérer les requêtes d'images
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  try {
    // Essayer le cache d'abord
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Sinon, récupérer depuis le réseau
    const networkResponse = await fetch(request);
    
    // Mettre en cache si la réponse est valide
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Image fetch failed', error);
    
    // Retourner une image placeholder en cas d'erreur
    const placeholderResponse = await cache.match('/images/placeholder.jpg');
    if (placeholderResponse) {
      return placeholderResponse;
    }
    
    throw error;
  }
}

// Gérer les ressources statiques
async function handleStaticResource(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    // Essayer le cache d'abord
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Sinon, récupérer depuis le réseau
    const networkResponse = await fetch(request);
    
    // Mettre en cache si la réponse est valide
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Static resource fetch failed', error);
    throw error;
  }
}

// Gérer les requêtes de pages
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request);
    
    // Mettre en cache si la réponse est valide
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Page fetch failed, trying cache', error);
    
    // Essayer le cache en cas d'échec réseau
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retourner une page offline
    const offlineResponse = await cache.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    throw error;
  }
}

// Gérer les requêtes par défaut
async function handleDefaultRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request);
    
    // Mettre en cache si la réponse est valide
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Default fetch failed, trying cache', error);
    
    // Essayer le cache en cas d'échec réseau
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Gérer les messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    event.ports[0].postMessage({
      type: 'CACHE_INFO',
      data: {
        cacheNames: ['STATIC_CACHE', 'IMAGE_CACHE', 'CACHE'],
        version: '1.0.0'
      }
    });
  }
});

// Nettoyer le cache périodiquement
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  const cacheNames = await caches.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const date = response.headers.get('date');
        if (date && (now - new Date(date).getTime()) > maxAge) {
          await cache.delete(request);
        }
      }
    }
  }
} 