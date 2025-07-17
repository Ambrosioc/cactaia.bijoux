#!/usr/bin/env node

/**
 * Script d'optimisation automatique des images
 * Usage: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class ImageOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      skipped: 0,
      errors: 0,
      totalSizeBefore: 0,
      totalSizeAfter: 0,
      timeSaved: 0
    };
    
    this.config = {
      // Formats supportés
      supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
      
      // Tailles cibles pour différentes utilisations
      sizes: {
        hero: { width: 1920, height: 1080, quality: 85 },
        product: { width: 800, height: 800, quality: 85 },
        thumbnail: { width: 400, height: 400, quality: 80 },
        small: { width: 200, height: 200, quality: 75 }
      },
      
      // Formats de sortie
      outputFormats: ['webp', 'avif'],
      
      // Dossier de sauvegarde
      backupDir: 'public/images/backup',
      
      // Dossier optimisé
      optimizedDir: 'public/images/optimized'
    };
  }

  // Obtenir la taille d'un fichier
  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  // Créer les dossiers nécessaires
  createDirectories() {
    const dirs = [this.config.backupDir, this.config.optimizedDir];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Créé le dossier: ${dir}`);
      }
    });
  }

  // Sauvegarder l'image originale
  backupImage(originalPath) {
    const filename = path.basename(originalPath);
    const backupPath = path.join(this.config.backupDir, filename);
    
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(originalPath, backupPath);
      console.log(`💾 Sauvegardé: ${filename}`);
    }
  }

  // Déterminer la taille optimale selon le nom du fichier
  getOptimalSize(filename) {
    const lowerFilename = filename.toLowerCase();
    
    if (lowerFilename.includes('hero') || lowerFilename.includes('banner')) {
      return this.config.sizes.hero;
    }
    
    if (lowerFilename.includes('product') || lowerFilename.includes('cactaïa')) {
      return this.config.sizes.product;
    }
    
    if (lowerFilename.includes('thumb') || lowerFilename.includes('small')) {
      return this.config.sizes.thumbnail;
    }
    
    // Par défaut, utiliser la taille produit
    return this.config.sizes.product;
  }

  // Optimiser une image
  async optimizeImage(imagePath) {
    const filename = path.basename(imagePath);
    const ext = path.extname(filename).toLowerCase();
    
    // Vérifier si c'est un format supporté
    if (!this.config.supportedFormats.includes(ext)) {
      console.log(`⏭️  Ignoré (format non supporté): ${filename}`);
      this.stats.skipped++;
      return;
    }

    try {
      console.log(`🔄 Optimisation de: ${filename}`);
      
      // Sauvegarder l'original
      this.backupImage(imagePath);
      
      // Obtenir la taille originale
      const originalSize = this.getFileSize(imagePath);
      this.stats.totalSizeBefore += originalSize;
      
      // Déterminer la taille optimale
      const targetSize = this.getOptimalSize(filename);
      
      // Charger l'image avec Sharp
      const image = sharp(imagePath);
      
      // Obtenir les métadonnées
      const metadata = await image.metadata();
      
      // Redimensionner si nécessaire
      if (metadata.width > targetSize.width || metadata.height > targetSize.height) {
        image.resize(targetSize.width, targetSize.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Optimiser pour chaque format de sortie
      for (const format of this.config.outputFormats) {
        const outputFilename = path.parse(filename).name + '.' + format;
        const outputPath = path.join(this.config.optimizedDir, outputFilename);
        
        let optimizedImage = image.clone();
        
        if (format === 'webp') {
          optimizedImage = optimizedImage.webp({ 
            quality: targetSize.quality,
            effort: 6
          });
        } else if (format === 'avif') {
          optimizedImage = optimizedImage.avif({ 
            quality: targetSize.quality,
            effort: 9
          });
        }
        
        await optimizedImage.toFile(outputPath);
        
        const optimizedSize = this.getFileSize(outputPath);
        this.stats.totalSizeAfter += optimizedSize;
        
        const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        console.log(`  ✅ ${format.toUpperCase()}: ${(optimizedSize / 1024).toFixed(1)}KB (-${reduction}%)`);
      }
      
      this.stats.processed++;
      
    } catch (error) {
      console.error(`❌ Erreur avec ${filename}:`, error.message);
      this.stats.errors++;
    }
  }

  // Traiter tous les fichiers d'un dossier
  async processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Dossier non trouvé: ${dirPath}`);
      return;
    }

    const files = fs.readdirSync(dirPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return this.config.supportedFormats.includes(ext);
    });

    console.log(`\n📂 Traitement de ${dirPath}: ${imageFiles.length} images trouvées\n`);

    for (const file of imageFiles) {
      const filePath = path.join(dirPath, file);
      await this.optimizeImage(filePath);
    }
  }

  // Générer un rapport
  generateReport() {
    console.log('\n📊 RAPPORT D\'OPTIMISATION');
    console.log('=' .repeat(50));
    
    const totalReduction = ((this.stats.totalSizeBefore - this.stats.totalSizeAfter) / this.stats.totalSizeBefore * 100).toFixed(1);
    const sizeSaved = (this.stats.totalSizeBefore - this.stats.totalSizeAfter) / (1024 * 1024);
    
    console.log(`📈 Images traitées: ${this.stats.processed}`);
    console.log(`⏭️  Images ignorées: ${this.stats.skipped}`);
    console.log(`❌ Erreurs: ${this.stats.errors}`);
    console.log(`💾 Taille avant: ${(this.stats.totalSizeBefore / (1024 * 1024)).toFixed(1)}MB`);
    console.log(`💾 Taille après: ${(this.stats.totalSizeAfter / (1024 * 1024)).toFixed(1)}MB`);
    console.log(`🎯 Réduction: ${totalReduction}% (${sizeSaved.toFixed(1)}MB économisés)`);
    
    if (this.stats.processed > 0) {
      console.log(`\n📁 Images optimisées disponibles dans: ${this.config.optimizedDir}`);
      console.log(`💾 Sauvegardes disponibles dans: ${this.config.backupDir}`);
    }
  }

  // Sauvegarder les statistiques
  saveStats() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `image-optimization-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'logs', filename);
    
    // Créer le dossier logs s'il n'existe pas
    const logsDir = path.dirname(filepath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      config: this.config
    };
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Rapport sauvegardé: ${filename}`);
  }

  // Exécuter l'optimisation
  async run() {
    console.log('🚀 Démarrage de l\'optimisation des images...\n');
    
    const startTime = Date.now();
    
    try {
      // Créer les dossiers nécessaires
      this.createDirectories();
      
      // Traiter le dossier images principal
      await this.processDirectory('public/images');
      
      // Calculer le temps total
      const totalTime = (Date.now() - startTime) / 1000;
      
      // Générer le rapport
      this.generateReport();
      this.saveStats();
      
      console.log(`\n⏱️  Temps total: ${totalTime.toFixed(1)}s`);
      console.log('✅ Optimisation terminée avec succès !');
      
      // Afficher les instructions d'utilisation
      console.log('\n📋 PROCHAINES ÉTAPES:');
      console.log('1. Vérifier les images optimisées dans public/images/optimized/');
      console.log('2. Remplacer les images originales par les versions optimisées');
      console.log('3. Mettre à jour les références dans le code');
      console.log('4. Relancer le test de performance');
      
    } catch (error) {
      console.error('\n❌ Erreur lors de l\'optimisation:', error.message);
      process.exit(1);
    }
  }
}

// Script pour remplacer automatiquement les images
class ImageReplacer {
  constructor() {
    this.optimizedDir = 'public/images/optimized';
    this.originalDir = 'public/images';
  }

  // Remplacer les images originales par les versions optimisées
  async replaceImages() {
    console.log('🔄 Remplacement des images originales...\n');
    
    if (!fs.existsSync(this.optimizedDir)) {
      console.log('❌ Dossier optimisé non trouvé. Lancez d\'abord l\'optimisation.');
      return;
    }

    const optimizedFiles = fs.readdirSync(this.optimizedDir);
    let replaced = 0;

    for (const file of optimizedFiles) {
      const ext = path.extname(file).toLowerCase();
      
      // Utiliser WebP par défaut, sinon AVIF
      if (ext === '.webp' || ext === '.avif') {
        const originalName = path.parse(file).name;
        const originalExt = '.jpg'; // Supposer que l'original est en JPG
        
        const optimizedPath = path.join(this.optimizedDir, file);
        const originalPath = path.join(this.originalDir, originalName + originalExt);
        
        if (fs.existsSync(originalPath)) {
          // Créer une copie de l'original avec l'extension optimisée
          const newPath = path.join(this.originalDir, originalName + ext);
          fs.copyFileSync(optimizedPath, newPath);
          
          console.log(`✅ Remplacé: ${originalName}${originalExt} → ${originalName}${ext}`);
          replaced++;
        }
      }
    }

    console.log(`\n📊 ${replaced} images remplacées`);
  }
}

// Exécuter le script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--replace')) {
    const replacer = new ImageReplacer();
    replacer.replaceImages();
  } else {
    const optimizer = new ImageOptimizer();
    optimizer.run();
  }
}

module.exports = { ImageOptimizer, ImageReplacer }; 