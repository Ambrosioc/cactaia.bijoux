// Configuration pour l'optimisation des images
export const IMAGE_CONFIG = {
  // Formats supportés
  formats: ['image/webp', 'image/avif'] as const,
  
  // Tailles d'écran pour les responsive images
  breakpoints: {
    mobile: 640,    // Plus précis pour mobile
    tablet: 768,    // Tablette
    desktop: 1024,  // Desktop
    large: 1200,    // Large desktop
    xl: 1920,       // Extra large
  },
  
  // Qualité par défaut (plus élevée sur mobile pour éviter la compression)
  defaultQuality: 90,
  
  // Tailles d'images par contexte - optimisées pour éviter la compression
  sizes: {
    // Images hero - pleine largeur sur mobile
    hero: '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw',
    
    // Images de produits
    product: {
      // Image principale - pleine largeur sur mobile, pas de compression
      main: '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw',
      // Thumbnail - taille fixe sur mobile
      thumbnail: '(max-width: 640px) 80px, (max-width: 768px) 100px, (max-width: 1024px) 120px, 150px',
      // Galerie - grille responsive
      gallery: '(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    },
    
    // Grilles d'images
    grid: {
      // Petite grille - 1 colonne sur mobile
      small: '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
      // Grille moyenne - 1 colonne sur mobile, 2 sur tablette
      medium: '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw',
      // Grande grille - 1 colonne sur mobile, 2 sur tablette
      large: '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw',
    },
    
    // Images de collection - optimisées pour mobile
    collection: {
      card: '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
      hero: '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw',
    },
    
    // Images utilitaires
    cart: '64px',
    avatar: '40px',
    icon: '24px',
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
  
  // Configuration responsive spécifique
  responsive: {
    // Qualité par breakpoint (plus élevée sur mobile)
    quality: {
      mobile: 95,    // Haute qualité sur mobile
      tablet: 90,    // Qualité élevée sur tablette
      desktop: 85,   // Qualité standard sur desktop
    },
    
    // Formats prioritaires par breakpoint
    formats: {
      mobile: ['webp', 'avif'],  // Formats modernes sur mobile
      tablet: ['webp', 'avif'],  // Formats modernes sur tablette
      desktop: ['webp', 'avif'], // Formats modernes sur desktop
    },
  },
} as const;

// Fonction utilitaire pour obtenir la taille appropriée
export function getImageSizes(context: keyof typeof IMAGE_CONFIG.sizes): string {
  return IMAGE_CONFIG.sizes[context] as string;
}

// Fonction pour obtenir la qualité optimale selon le breakpoint
export function getOptimalQuality(breakpoint: keyof typeof IMAGE_CONFIG.responsive.quality): number {
  return IMAGE_CONFIG.responsive.quality[breakpoint];
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

// Fonction pour obtenir les tailles d'images optimisées selon le contexte
export function getResponsiveImageSizes(
  context: 'hero' | 'product' | 'grid' | 'collection',
  variant?: string
): string {
  if (context === 'product' && variant) {
    return IMAGE_CONFIG.sizes.product[variant as keyof typeof IMAGE_CONFIG.sizes.product] || IMAGE_CONFIG.sizes.product.main;
  }
  
  if (context === 'grid' && variant) {
    return IMAGE_CONFIG.sizes.grid[variant as keyof typeof IMAGE_CONFIG.sizes.grid] || IMAGE_CONFIG.sizes.grid.medium;
  }
  
  if (context === 'collection' && variant) {
    return IMAGE_CONFIG.sizes.collection[variant as keyof typeof IMAGE_CONFIG.sizes.collection] || IMAGE_CONFIG.sizes.collection.card;
  }
  
  return IMAGE_CONFIG.sizes[context] as string;
} 