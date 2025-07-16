// Gestionnaire de service worker pour optimiser les performances

class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSupported = 'serviceWorker' in navigator;

  private constructor() {}

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  async register(): Promise<void> {
    if (!this.isSupported) {
      console.log('Service Worker non supporté');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker enregistré:', this.swRegistration);

      // Écouter les mises à jour
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version disponible
              this.showUpdateNotification();
            }
          });
        }
      });

      // Écouter les messages du service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_INFO') {
          console.log('Cache info:', event.data.data);
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
    }
  }

  private showUpdateNotification(): void {
    // Créer une notification de mise à jour
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #667eea;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-weight: 600; margin-bottom: 5px;">Nouvelle version disponible</div>
          <div style="font-size: 12px; opacity: 0.9;">Cliquez pour mettre à jour</div>
        </div>
        <button id="update-btn" style="
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          margin-left: 10px;
        ">Mettre à jour</button>
      </div>
    `;

    // Ajouter le style d'animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Gérer le clic sur le bouton de mise à jour
    const updateBtn = notification.querySelector('#update-btn');
    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        this.updateServiceWorker();
        notification.remove();
      });
    }

    // Auto-suppression après 10 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  private async updateServiceWorker(): Promise<void> {
    if (this.swRegistration && this.swRegistration.waiting) {
      // Envoyer un message au service worker pour déclencher la mise à jour
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recharger la page après la mise à jour
      window.location.reload();
    }
  }

  async getCacheInfo(): Promise<any> {
    if (!this.swRegistration) {
      return null;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        if (event.data && event.data.type === 'CACHE_INFO') {
          resolve(event.data.data);
        }
      };

      this.swRegistration!.active?.postMessage(
        { type: 'GET_CACHE_INFO' },
        [channel.port2]
      );
    });
  }

  async clearCache(): Promise<void> {
    if (!this.isSupported) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache nettoyé');
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  }

  async preloadResources(urls: string[]): Promise<void> {
    if (!this.isSupported) return;

    try {
      const cache = await caches.open('cactaia-preload-v1');
      await Promise.all(
        urls.map(url => 
          fetch(url).then(response => {
            if (response.ok) {
              return cache.put(url, response);
            }
          }).catch(() => {
            // Ignorer les erreurs de préchargement
          })
        )
      );
    } catch (error) {
      console.error('Erreur lors du préchargement:', error);
    }
  }

  // Précharger les ressources importantes
  async preloadCriticalResources(): Promise<void> {
    const criticalUrls = [
      '/images/placeholder.jpg',
      '/favicon.ico',
      '/manifest.json'
    ];

    await this.preloadResources(criticalUrls);
  }

  // Vérifier si le service worker est actif
  isActive(): boolean {
    return this.swRegistration?.active?.state === 'activated';
  }

  // Obtenir les statistiques du cache
  async getCacheStats(): Promise<{
    totalSize: number;
    itemCount: number;
    cacheNames: string[];
  }> {
    if (!this.isSupported) {
      return { totalSize: 0, itemCount: 0, cacheNames: [] };
    }

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      let itemCount = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        itemCount += requests.length;

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return {
        totalSize,
        itemCount,
        cacheNames
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return { totalSize: 0, itemCount: 0, cacheNames: [] };
    }
  }
}

// Exporter l'instance singleton
export const serviceWorkerManager = ServiceWorkerManager.getInstance();

// Fonction d'initialisation automatique
export function initializeServiceWorker(): void {
  if (typeof window !== 'undefined') {
    serviceWorkerManager.register();
  }
}

// Hook React pour utiliser le service worker
import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [isActive, setIsActive] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    const checkStatus = () => {
      setIsActive(serviceWorkerManager.isActive());
    };

    const loadCacheStats = async () => {
      const stats = await serviceWorkerManager.getCacheStats();
      setCacheStats(stats);
    };

    checkStatus();
    loadCacheStats();

    // Vérifier périodiquement
    const interval = setInterval(() => {
      checkStatus();
      loadCacheStats();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  return {
    isActive,
    cacheStats,
    clearCache: serviceWorkerManager.clearCache.bind(serviceWorkerManager),
    preloadResources: serviceWorkerManager.preloadResources.bind(serviceWorkerManager)
  };
} 