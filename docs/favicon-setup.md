# Configuration du Favicon - Cactaia.Bijoux

## 📋 Vue d'ensemble

Le favicon de Cactaia.Bijoux a été configuré pour être compatible avec tous les navigateurs et appareils modernes.

## 🎯 Fichiers créés

### Icônes principales
- `favicon.ico` - Icône principale (format ICO)
- `favicon-16x16.png` - Icône 16x16 pixels
- `favicon-32x32.png` - Icône 32x32 pixels
- `apple-touch-icon.png` - Icône pour iOS (180x180)
- `android-chrome-192x192.png` - Icône Android 192x192
- `android-chrome-512x512.png` - Icône Android 512x512

### Fichiers de configuration
- `site.webmanifest` - Manifest pour PWA
- `robots.txt` - Configuration SEO

## 🔧 Configuration dans Next.js

### Layout principal (`app/layout.tsx`)
```typescript
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  // ... autres métadonnées
};
```

### Balises HTML ajoutées
```html
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#ffffff" />
```

## 📱 Support des appareils

### Desktop
- Chrome, Firefox, Safari, Edge : `favicon.ico`
- Résolutions multiples : 16x16, 32x32

### Mobile
- iOS : `apple-touch-icon.png` (180x180)
- Android : `android-chrome-192x192.png` et `android-chrome-512x512.png`

### PWA
- Manifest : `site.webmanifest`
- Installation sur l'écran d'accueil

## 🎨 Personnalisation

### Couleurs
- Theme color : `#ffffff` (blanc)
- Background color : `#ffffff` (blanc)

### Métadonnées
- Nom : "Cactaia.Bijoux"
- Nom court : "Cactaia"
- Description : "Bijoux écoresponsables et élégants"

## 🔄 Mise à jour

Pour mettre à jour le favicon :

1. Remplacez `public/favicon.ico` par votre nouvelle icône
2. Régénérez les tailles PNG si nécessaire
3. Mettez à jour les métadonnées dans `app/layout.tsx` si besoin

## 📊 SEO et Performance

### Optimisations
- Icônes optimisées pour chaque taille d'écran
- Manifest PWA pour une meilleure expérience mobile
- Robots.txt configuré pour le référencement
- Métadonnées Open Graph et Twitter Card

### Vérification
- Testez sur différents navigateurs
- Vérifiez l'affichage sur mobile
- Testez l'installation PWA

## 🛠️ Outils recommandés

- [Favicon Generator](https://realfavicongenerator.net/) - Pour générer toutes les tailles
- [Favicon Checker](https://www.favicon-checker.com/) - Pour vérifier la compatibilité
- [PWA Builder](https://www.pwabuilder.com/) - Pour optimiser le manifest 