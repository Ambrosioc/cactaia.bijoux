// Configuration pour l'optimisation des images
export const IMAGE_CONFIG = {
  // Formats supportés
  formats: ['image/webp', 'image/avif'] as const,
  
  // Tailles d'écran pour les responsive images
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    large: 1920,
  },
  
  // Qualité par défaut
  defaultQuality: 85,
  
  // Tailles d'images par contexte
  sizes: {
    hero: '(max-width: 768px) 100vw, 100vw',
    product: {
      main: '(max-width: 768px) 100vw, 50vw',
      thumbnail: '(max-width: 768px) 33vw, 15vw',
      gallery: '(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw',
    },
    grid: {
      small: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      medium: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw',
      large: '(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw',
    },
    cart: '64px',
    avatar: '40px',
  },
  
  // Placeholder par défaut
  placeholder: '/placeholder.jpg',
  
  // Domaines autorisés pour les images externes
  allowedDomains: [
    'images.pexels.com',
    'images.unsplash.com',
    'lh3.googleusercontent.com',
    'avatars.githubusercontent.com',
  ],
  
  // Configuration pour le lazy loading
  lazyLoading: {
    threshold: 0.1,
    rootMargin: '50px',
  },
  
  // Configuration pour la précharge
  preload: {
    priority: ['hero', 'product-main'],
    delay: 100, // ms
  },
} as const;

// Fonction utilitaire pour obtenir la taille appropriée
export function getImageSizes(context: keyof typeof IMAGE_CONFIG.sizes): string {
  return IMAGE_CONFIG.sizes[context] as string;
}

// Fonction pour vérifier si une URL d'image est autorisée
export function isAllowedImageDomain(url: string): boolean {
  try {
    const domain = new URL(url).hostname;
    return IMAGE_CONFIG.allowedDomains.some(allowed => 
      domain === allowed || domain.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

// Fonction pour optimiser les URLs d'images
export function optimizeImageUrl(url: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif';
}): string {
  // Si c'est une image locale, laisser Next.js s'en occuper
  if (url.startsWith('/') || url.startsWith('./')) {
    return url;
  }
  
  // Pour les images externes, retourner l'URL originale
  // Next.js s'occupera de l'optimisation via la configuration
  return url;
} 