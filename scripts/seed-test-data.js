#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (utilise les variables d'environnement du système)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Données fictives pour les produits
const produits = [
  {
    nom: "Bracelet Élégance Cactus",
    description: "Bracelet délicat en argent sterling avec pendentif cactus en pierre naturelle. Parfait pour un look bohème chic.",
    description_courte: "Bracelet cactus en argent sterling",
    prix: 89.99,
    prix_promo: 69.99,
    categorie: "Bracelets",
    collections: ["Été 2025", "Nouveautés", "Bestsellers"],
    stock: 25,
    sku: "BRAC-CACT-001",
    images: ["/images/cactaïa-01.jpg", "/images/cactaïa-02.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 15,
    variations: {
      tailles: ["16cm", "18cm", "20cm"],
      couleurs: ["Argent", "Doré"]
    }
  },
  {
    nom: "Collier Désert Bloom",
    description: "Collier long avec plusieurs pendentifs cactus en résine colorée. Idéal pour les tenues d'été.",
    description_courte: "Collier multi-pendentifs cactus",
    prix: 129.99,
    categorie: "Colliers",
    collections: ["Été 2025", "Désert", "Femme"],
    stock: 12,
    sku: "COLL-DES-002",
    images: ["/images/cactaïa-03.jpg", "/images/cactaïa-04.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 25,
    variations: {
      longueurs: ["45cm", "60cm"],
      couleurs: ["Vert", "Rose", "Bleu"]
    }
  },
  {
    nom: "Boucles d'Oreilles Mini Cactus",
    description: "Boucles d'oreilles mignonnes en forme de petits cactus. Parfaites pour un look décontracté.",
    description_courte: "Boucles d'oreilles cactus",
    prix: 45.99,
    prix_promo: 35.99,
    categorie: "Boucles d'oreilles",
    collections: ["Nouveautés", "Mixte"],
    stock: 8,
    sku: "BOUC-MIN-003",
    images: ["/images/cactaïa-05.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    poids_grammes: 8,
    variations: {
      couleurs: ["Vert", "Rose", "Jaune"]
    }
  },
  {
    nom: "Bague Cactus Dorée",
    description: "Bague élégante avec un petit cactus en or 18 carats. Un bijou unique et symbolique.",
    description_courte: "Bague cactus en or 18 carats",
    prix: 199.99,
    prix_promo: 159.99,
    categorie: "Bagues",
    collections: ["Bestsellers", "Femme"],
    stock: 15,
    sku: "BAGU-CACT-004",
    images: ["/images/cactaïa-06.jpg", "/images/cactaïa-07.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 12,
    variations: {
      tailles: ["50", "52", "54", "56", "58"],
      couleurs: ["Or jaune", "Or blanc", "Or rose"]
    }
  },
  {
    nom: "Collier Minimaliste Cactus",
    description: "Collier fin avec un petit pendentif cactus en argent. Design épuré et moderne.",
    description_courte: "Collier fin avec pendentif cactus",
    prix: 79.99,
    categorie: "Colliers",
    collections: ["Mixte", "Désert"],
    stock: 20,
    sku: "COLL-MIN-005",
    images: ["/images/cactaïa-08.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    poids_grammes: 18,
    variations: {
      longueurs: ["40cm", "45cm"],
      couleurs: ["Argent", "Doré"]
    }
  },
  {
    nom: "Bracelet Tressé Désert",
    description: "Bracelet tressé en cuir avec perles cactus. Style ethnique et authentique.",
    description_courte: "Bracelet tressé avec perles cactus",
    prix: 65.99,
    categorie: "Bracelets",
    collections: ["Désert", "Homme", "Mixte"],
    stock: 30,
    sku: "BRAC-TRE-006",
    images: ["/images/cactaïa-09.jpg", "/images/cactaïa-10.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    poids_grammes: 22,
    variations: {
      tailles: ["18cm", "20cm", "22cm"],
      couleurs: ["Marron", "Noir", "Beige"]
    }
  },
  {
    nom: "Boucles d'Oreilles Étoiles",
    description: "Boucles d'oreilles en forme d'étoiles du désert. Élégantes et originales.",
    description_courte: "Boucles d'oreilles étoiles du désert",
    prix: 55.99,
    prix_promo: 45.99,
    categorie: "Boucles d'oreilles",
    collections: ["Été 2025", "Femme"],
    stock: 18,
    sku: "BOUC-ETO-007",
    images: ["/images/cactaïa-11.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 10,
    variations: {
      couleurs: ["Argent", "Doré", "Rose"]
    }
  },
  {
    nom: "Bague Alliance Cactus",
    description: "Alliance avec gravure cactus subtile. Parfaite pour les amoureux du désert.",
    description_courte: "Alliance avec gravure cactus",
    prix: 299.99,
    categorie: "Bagues",
    collections: ["Bestsellers", "Mixte"],
    stock: 10,
    sku: "BAGU-ALL-008",
    images: ["/images/cactaïa-12.jpg", "/images/cactaïa-13.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 8,
    variations: {
      tailles: ["50", "52", "54", "56", "58", "60"],
      couleurs: ["Or blanc", "Or jaune"]
    }
  },
  {
    nom: "Collier Choker Désert",
    description: "Choker en velours avec pendentif cactus en métal. Style rétro et tendance.",
    description_courte: "Choker velours avec pendentif cactus",
    prix: 89.99,
    categorie: "Colliers",
    collections: ["Nouveautés", "Femme"],
    stock: 14,
    sku: "COLL-CHO-009",
    images: ["/images/cactaïa-14.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    poids_grammes: 30,
    variations: {
      tailles: ["36cm", "38cm", "40cm"],
      couleurs: ["Noir", "Bordeaux", "Vert"]
    }
  },
  {
    nom: "Bracelet Élastique Cactus",
    description: "Bracelet élastique avec perles cactus colorées. Confortable et stylé.",
    description_courte: "Bracelet élastique avec perles cactus",
    prix: 35.99,
    categorie: "Bracelets",
    collections: ["Été 2025", "Mixte"],
    stock: 40,
    sku: "BRAC-ELA-010",
    images: ["/images/cactaïa-15.jpg", "/images/cactaïa-16.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    poids_grammes: 15,
    variations: {
      tailles: ["Unique"],
      couleurs: ["Multicolore", "Vert", "Rose", "Bleu"]
    }
  },
  {
    nom: "Boucles d'Oreilles Géométriques",
    description: "Boucles d'oreilles géométriques inspirées des formes du désert. Design contemporain.",
    description_courte: "Boucles d'oreilles géométriques",
    prix: 75.99,
    categorie: "Boucles d'oreilles",
    collections: ["Nouveautés", "Femme"],
    stock: 22,
    sku: "BOUC-GEO-011",
    images: ["/images/cactaïa-17.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 12,
    variations: {
      couleurs: ["Argent", "Doré", "Cuivre"]
    }
  },
  {
    nom: "Bague Solitaire Cactus",
    description: "Bague solitaire avec saphir et gravure cactus. Élégance et originalité.",
    description_courte: "Bague solitaire avec saphir",
    prix: 399.99,
    prix_promo: 349.99,
    categorie: "Bagues",
    collections: ["Bestsellers", "Femme"],
    stock: 8,
    sku: "BAGU-SOL-012",
    images: ["/images/cactaïa-18.jpg", "/images/cactaïa-19.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 6,
    variations: {
      tailles: ["52", "54", "56", "58"],
      couleurs: ["Or blanc", "Or jaune"]
    }
  },
  {
    nom: "Collier Lariat Désert",
    description: "Collier lariat avec extrémités cactus. Style bohème et sophistiqué.",
    description_courte: "Collier lariat avec extrémités cactus",
    prix: 149.99,
    categorie: "Colliers",
    collections: ["Désert", "Mixte"],
    stock: 16,
    sku: "COLL-LAR-013",
    images: ["/images/cactaïa-20.jpg", "/images/cactaïa-21.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    poids_grammes: 35,
    variations: {
      longueurs: ["70cm", "80cm"],
      couleurs: ["Argent", "Doré"]
    }
  },
  {
    nom: "Bracelet Manchette Cactus",
    description: "Manchette en métal avec motif cactus gravé. Élégant et moderne.",
    description_courte: "Manchette avec motif cactus",
    prix: 120.99,
    categorie: "Bracelets",
    collections: ["Nouveautés", "Homme"],
    stock: 12,
    sku: "BRAC-MAN-014",
    images: ["/images/cactaïa-22.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 45,
    variations: {
      tailles: ["18cm", "19cm", "20cm"],
      couleurs: ["Argent", "Doré", "Cuivre"]
    }
  },
  {
    nom: "Boucles d'Oreilles Clous Cactus",
    description: "Clous d'oreilles avec petit cactus en résine. Discrets et mignons.",
    description_courte: "Clous d'oreilles cactus",
    prix: 28.99,
    categorie: "Boucles d'oreilles",
    collections: ["Été 2025", "Mixte"],
    stock: 35,
    sku: "BOUC-CLO-015",
    images: ["/images/cactaïa-23.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    poids_grammes: 5,
    variations: {
      couleurs: ["Vert", "Rose", "Jaune", "Bleu"]
    }
  },
  {
    nom: "Bague Cocktail Cactus",
    description: "Bague cocktail avec plusieurs pierres et motif cactus. Spectaculaire et unique.",
    description_courte: "Bague cocktail avec pierres",
    prix: 250.99,
    categorie: "Bagues",
    collections: ["Bestsellers", "Femme"],
    stock: 6,
    sku: "BAGU-COC-016",
    images: ["/images/cactaïa-24.jpg", "/images/cactaïa-25.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 15,
    variations: {
      tailles: ["54", "56", "58"],
      couleurs: ["Or blanc", "Or jaune"]
    }
  },
  {
    nom: "Écharpe Accessoire Désert",
    description: "Écharpe légère avec motif cactus. Accessoire parfait pour compléter votre look.",
    description_courte: "Écharpe avec motif cactus",
    prix: 45.99,
    categorie: "Accessoires",
    collections: ["Été 2025", "Mixte"],
    stock: 25,
    sku: "ACC-ECH-017",
    images: ["/images/cactaïa-01.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    poids_grammes: 80,
    variations: {
      couleurs: ["Beige", "Rose", "Vert", "Bleu"]
    }
  },
  {
    nom: "Pochette Cactus",
    description: "Pochette en cuir avec broderie cactus. Élégante et pratique.",
    description_courte: "Pochette cuir avec broderie cactus",
    prix: 85.99,
    categorie: "Accessoires",
    collections: ["Nouveautés", "Femme"],
    stock: 18,
    sku: "ACC-POC-018",
    images: ["/images/cactaïa-02.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 120,
    variations: {
      couleurs: ["Marron", "Noir", "Beige"]
    }
  },
  {
    nom: "Chapeau Désert",
    description: "Chapeau en paille avec bandeau cactus. Protection et style.",
    description_courte: "Chapeau paille avec bandeau cactus",
    prix: 65.99,
    categorie: "Accessoires",
    collections: ["Été 2025", "Mixte"],
    stock: 20,
    sku: "ACC-CHA-019",
    images: ["/images/cactaïa-03.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    poids_grammes: 150,
    variations: {
      tailles: ["S", "M", "L"],
      couleurs: ["Beige", "Blanc", "Marron"]
    }
  },
  {
    nom: "Ceinture Cactus",
    description: "Ceinture en cuir avec boucle cactus. Accessoire tendance et original.",
    description_courte: "Ceinture cuir avec boucle cactus",
    prix: 95.99,
    categorie: "Accessoires",
    collections: ["Désert", "Homme"],
    stock: 15,
    sku: "ACC-CEI-020",
    images: ["/images/cactaïa-04.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 200,
    variations: {
      tailles: ["80cm", "85cm", "90cm", "95cm"],
      couleurs: ["Marron", "Noir"]
    }
  }
];

// --- AJOUT DE NOUVEAUX PRODUITS FICTIFS POUR TESTER LES COLLECTIONS ---
const produitsFictifsCollections = [
  {
    nom: "Bague Soleil d'Été",
    description: "Bague dorée inspirée du soleil, parfaite pour la collection été.",
    description_courte: "Bague dorée soleil",
    prix: 59.99,
    categorie: "Bagues",
    collections: ["Été 2025"],
    stock: 10,
    sku: "BAGU-SOL-021",
    images: ["/images/cactaïa-11.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    variations: {}
  },
  {
    nom: "Bracelet Mixte Urban",
    description: "Bracelet moderne pour tous les genres, style urbain.",
    description_courte: "Bracelet mixte urbain",
    prix: 39.99,
    categorie: "Bracelets",
    collections: ["Mixte", "Nouveautés"],
    stock: 20,
    sku: "BRAC-URB-022",
    images: ["/images/cactaïa-12.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    variations: {}
  },
  {
    nom: "Collier Best Seller",
    description: "Collier minimaliste, best seller de la saison.",
    description_courte: "Collier best seller",
    prix: 89.99,
    categorie: "Colliers",
    collections: ["Bestsellers"],
    stock: 15,
    sku: "COLL-BES-023",
    images: ["/images/cactaïa-13.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    variations: {}
  },
  {
    nom: "Boucles d'Oreilles Désert Chic",
    description: "Boucles d'oreilles inspirées du désert, look chic et naturel.",
    description_courte: "Boucles désert chic",
    prix: 49.99,
    categorie: "Boucles d'oreilles",
    collections: ["Désert", "Femme"],
    stock: 12,
    sku: "BOUC-DES-024",
    images: ["/images/cactaïa-14.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    variations: {}
  },
  {
    nom: "Bague Homme Graphique",
    description: "Bague graphique pour homme, design contemporain.",
    description_courte: "Bague homme graphique",
    prix: 79.99,
    categorie: "Bagues",
    collections: ["Homme"],
    stock: 8,
    sku: "BAGU-HOM-025",
    images: ["/images/cactaïa-15.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    variations: {}
  },
  {
    nom: "Collier Femme Élégance",
    description: "Collier élégant pour femme, parfait pour toutes occasions.",
    description_courte: "Collier femme élégance",
    prix: 99.99,
    categorie: "Colliers",
    collections: ["Femme", "Nouveautés"],
    stock: 18,
    sku: "COLL-FEM-026",
    images: ["/images/cactaïa-16.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    variations: {}
  },
  {
    nom: "Bracelet Désert Homme",
    description: "Bracelet en cuir inspiré du désert pour homme.",
    description_courte: "Bracelet désert homme",
    prix: 55.99,
    categorie: "Bracelets",
    collections: ["Désert", "Homme"],
    stock: 14,
    sku: "BRAC-DES-027",
    images: ["/images/cactaïa-17.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    variations: {}
  },
  {
    nom: "Boucles d'Oreilles Multi-Collections",
    description: "Boucles d'oreilles présentes dans plusieurs collections.",
    description_courte: "Boucles multi-collections",
    prix: 69.99,
    categorie: "Boucles d'oreilles",
    collections: ["Été 2025", "Nouveautés", "Femme"],
    stock: 16,
    sku: "BOUC-MUL-028",
    images: ["/images/cactaïa-18.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    variations: {}
  },
  {
    nom: "Bague Sans Collection",
    description: "Bague test sans collection pour vérifier les cas limites.",
    description_courte: "Bague sans collection",
    prix: 29.99,
    categorie: "Bagues",
    collections: [],
    stock: 5,
    sku: "BAGU-SAN-029",
    images: ["/images/cactaïa-19.jpg"],
    est_actif: true,
    est_mis_en_avant: false,
    variations: {}
  },
  {
    nom: "Accessoire Mixte Star",
    description: "Accessoire tendance pour tous, star de la saison.",
    description_courte: "Accessoire mixte star",
    prix: 19.99,
    categorie: "Accessoires",
    collections: ["Mixte", "Bestsellers"],
    stock: 30,
    sku: "ACC-MIX-030",
    images: ["/images/cactaïa-20.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    variations: {}
  }
];

// Ajout à la seed principale
produits.push(...produitsFictifsCollections);

async function seedProducts() {
  console.log('🌱 Début du seeding des produits...');

  try {
    // Supprimer TOUS les produits existants
    const { error: deleteError } = await supabase
      .from('produits')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprime tout

    if (deleteError) {
      console.log('Note: Impossible de supprimer les produits existants:', deleteError.message);
    } else {
      console.log('🗑️ Produits existants supprimés');
    }

    // Insérer les nouveaux produits
    const { data, error } = await supabase
      .from('produits')
      .insert(produits)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ ${data.length} produits insérés avec succès !`);
    
    // Afficher un résumé par catégorie
    const categories = {};
    data.forEach(produit => {
      categories[produit.categorie] = (categories[produit.categorie] || 0) + 1;
    });
    
    console.log('\n📊 Répartition par catégorie:');
    Object.entries(categories).forEach(([categorie, count]) => {
      console.log(`   ${categorie}: ${count} produits`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  }
}

// Exécuter le seeding
seedProducts(); 