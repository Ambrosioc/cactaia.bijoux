#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Données fictives pour les produits
const produits = [
  {
    nom: "Bracelet Élégance Cactus",
    description: "Bracelet délicat en argent sterling avec pendentif cactus en pierre naturelle. Parfait pour un look bohème chic.",
    description_courte: "Bracelet cactus en argent sterling",
    prix: 89.99,
    prix_promo: 69.99,
    categorie: "Bracelets",
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
    nom: "Bague Cactus Royal",
    description: "Bague élégante avec un cactus en pierre semi-précieuse sertie d'argent. Un bijou unique et sophistiqué.",
    description_courte: "Bague cactus en pierre semi-précieuse",
    prix: 199.99,
    categorie: "Bagues",
    stock: 3,
    sku: "BAGU-ROY-004",
    images: ["/images/cactaïa-06.jpg", "/images/cactaïa-07.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 12,
    variations: {
      tailles: ["50", "52", "54", "56", "58"],
      pierres: ["Agate", "Jaspe", "Quartz rose"]
    }
  },
  {
    nom: "Set Cactus Complet",
    description: "Set complet comprenant bracelet, collier et boucles d'oreilles assortis. Parfait pour offrir.",
    description_courte: "Set complet cactus 3 pièces",
    prix: 249.99,
    prix_promo: 199.99,
    categorie: "Sets",
    stock: 15,
    sku: "SET-COM-005",
    images: ["/images/cactaïa-08.jpg", "/images/cactaïa-09.jpg"],
    est_actif: true,
    est_mis_en_avant: true,
    poids_grammes: 45,
    variations: {
      couleurs: ["Argent", "Doré", "Rose"]
    }
  }
];

// Données fictives pour les adresses
const adresses = [
  {
    user_id: null, // Sera rempli après création des utilisateurs
    nom_complet: "Marie Dupont",
    ligne_1: "123 Rue de la Paix",
    ligne_2: "Appartement 4B",
    code_postal: "75001",
    ville: "Paris",
    pays: "France",
    telephone: "01 23 45 67 89",
    est_principale: true
  },
  {
    user_id: null,
    nom_complet: "Jean Martin",
    ligne_1: "456 Avenue des Champs",
    ligne_2: null,
    code_postal: "69001",
    ville: "Lyon",
    pays: "France",
    telephone: "04 56 78 90 12",
    est_principale: true
  },
  {
    user_id: null,
    nom_complet: "Sophie Bernard",
    ligne_1: "789 Boulevard de la Liberté",
    ligne_2: "Résidence Le Jardin",
    code_postal: "13001",
    ville: "Marseille",
    pays: "France",
    telephone: "04 91 23 45 67",
    est_principale: true
  }
];

// Données fictives pour les commandes
const commandes = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    user_id: null, // Sera rempli après création des utilisateurs
    numero_commande: "CMD-2024-001",
    montant_total: 159.98,
    statut: "payee",
    adresse_livraison: {
      nom: "Marie Dupont",
      adresse: "123 Rue de la Paix",
      ville: "Paris",
      code_postal: "75001",
      pays: "France"
    }
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    user_id: null,
    numero_commande: "CMD-2024-002",
    montant_total: 89.99,
    statut: "payee",
    adresse_livraison: {
      nom: "Jean Martin",
      adresse: "456 Avenue des Champs",
      ville: "Lyon",
      code_postal: "69001",
      pays: "France"
    }
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    user_id: null,
    numero_commande: "CMD-2024-003",
    montant_total: 199.99,
    statut: "payee",
    adresse_livraison: {
      nom: "Sophie Bernard",
      adresse: "789 Boulevard de la Liberté",
      ville: "Marseille",
      code_postal: "13001",
      pays: "France"
    }
  }
];

// Données fictives pour les avis
const avis = [
  {
    product_id: null, // Sera rempli après création des produits
    user_id: null, // Sera rempli après création des utilisateurs
    rating: 5,
    title: "Magnifique bracelet !",
    comment: "J'adore ce bracelet, il est parfait pour mes tenues d'été. La qualité est excellente et le design est unique.",
    is_verified_purchase: true,
    status: "approved"
  },
  {
    product_id: null,
    user_id: null,
    rating: 4,
    title: "Très joli collier",
    comment: "Le collier est très beau, les pendentifs sont bien faits. Seul petit bémol : la chaîne pourrait être un peu plus solide.",
    is_verified_purchase: true,
    status: "approved"
  },
  {
    product_id: null,
    user_id: null,
    rating: 5,
    title: "Parfait pour offrir",
    comment: "J'ai offert le set complet à ma sœur pour son anniversaire, elle était ravie ! La qualité est au rendez-vous.",
    is_verified_purchase: true,
    status: "approved"
  },
  {
    product_id: null,
    user_id: null,
    rating: 3,
    title: "Correct mais pourrait être mieux",
    comment: "Le produit est correct mais j'attendais un peu mieux pour le prix. La livraison était rapide.",
    is_verified_purchase: true,
    status: "approved"
  }
];

// Données fictives pour les analytics
const analyticsEvents = [
  {
    event_type: "page_view",
    page_url: "/",
    session_id: "sess-001",
    metadata: { referrer: "google.com" }
  },
  {
    event_type: "page_view",
    page_url: "/boutique",
    session_id: "sess-001",
    metadata: { referrer: "google.com" }
  },
  {
    event_type: "product_view",
    page_url: "/produit/bracelet-elegance-cactus",
    session_id: "sess-001",
    product_name: "Bracelet Élégance Cactus",
    product_price: 89.99,
    metadata: { referrer: "google.com" }
  },
  {
    event_type: "add_to_cart",
    page_url: "/produit/bracelet-elegance-cactus",
    session_id: "sess-001",
    product_name: "Bracelet Élégance Cactus",
    product_price: 89.99,
    metadata: { quantity: 1 }
  },
  {
    event_type: "purchase",
    page_url: "/confirmation",
    session_id: "sess-001",
    order_total: 159.98,
    metadata: { items_count: 2 }
  },
  {
    event_type: "page_view",
    page_url: "/produit/collier-desert-bloom",
    session_id: "sess-002",
    product_name: "Collier Désert Bloom",
    product_price: 129.99,
    metadata: { referrer: "facebook.com" }
  },
  {
    event_type: "add_to_cart",
    page_url: "/produit/collier-desert-bloom",
    session_id: "sess-002",
    product_name: "Collier Désert Bloom",
    product_price: 129.99,
    metadata: { quantity: 1 }
  }
];

async function seedProduits() {
  log('\n🌵 Récupération des produits existants...', 'blue');
  
  const { data: produitsExistants, error } = await supabase
    .from('produits')
    .select('*')
    .eq('est_actif', true);

  if (error) {
    log(`❌ Erreur récupération produits: ${error.message}`, 'red');
    return [];
  }

  log(`✅ ${produitsExistants.length} produits trouvés`, 'green');
  produitsExistants.forEach(p => {
    log(`   - ${p.nom} (ID: ${p.id})`, 'reset');
  });
  
  return produitsExistants;
}

async function seedAdresses(utilisateursCrees) {
  log('\n📍 Création des adresses...', 'blue');
  
  const adressesCrees = [];
  
  // Assigner les IDs des utilisateurs aux adresses
  const adressesAvecUsers = adresses.map((adresse, index) => ({
    ...adresse,
    user_id: utilisateursCrees[index % utilisateursCrees.length].id
  }));
  
  for (const adresse of adressesAvecUsers) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert(adresse)
        .select()
        .single();

      if (error) {
        log(`❌ Erreur création adresse: ${error.message}`, 'red');
      } else {
        log(`✅ Adresse créée: ${adresse.nom_complet} - ${adresse.ville}`, 'green');
        adressesCrees.push(data);
      }
    } catch (err) {
      log(`❌ Exception création adresse: ${err.message}`, 'red');
    }
  }
  
  return adressesCrees;
}

async function seedCommandes(utilisateursCrees) {
  log('\n📦 Création des commandes...', 'blue');
  
  // Assigner les IDs des utilisateurs aux commandes
  const commandesAvecUsers = commandes.map((commande, index) => ({
    ...commande,
    user_id: utilisateursCrees[index % utilisateursCrees.length].id
  }));
  
  for (const commande of commandesAvecUsers) {
    try {
      const { data, error } = await supabase
        .from('commandes')
        .insert(commande)
        .select()
        .single();

      if (error) {
        log(`❌ Erreur création commande ${commande.numero_commande}: ${error.message}`, 'red');
      } else {
        log(`✅ Commande créée: ${commande.numero_commande}`, 'green');
      }
    } catch (err) {
      log(`❌ Exception création commande ${commande.numero_commande}: ${err.message}`, 'red');
    }
  }
}

async function seedAvis(produitsCrees, utilisateursCrees) {
  log('\n⭐ Création des avis...', 'blue');
  
  // Assigner les IDs des produits et utilisateurs aux avis
  const avisAvecRelations = avis.map((avis, index) => ({
    ...avis,
    product_id: produitsCrees[index % produitsCrees.length].id,
    user_id: utilisateursCrees[index % utilisateursCrees.length].id
  }));
  
  for (const avis of avisAvecRelations) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(avis)
        .select()
        .single();

      if (error) {
        log(`❌ Erreur création avis: ${error.message}`, 'red');
      } else {
        log(`✅ Avis créé: ${avis.title}`, 'green');
      }
    } catch (err) {
      log(`❌ Exception création avis: ${err.message}`, 'red');
    }
  }
}

async function seedAnalytics() {
  log('\n📊 Création des événements analytics...', 'blue');
  
  for (const event of analyticsEvents) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .insert(event)
        .select()
        .single();

      if (error) {
        log(`❌ Erreur création événement analytics: ${error.message}`, 'red');
      } else {
        log(`✅ Événement analytics créé: ${event.event_type}`, 'green');
      }
    } catch (err) {
      log(`❌ Exception création événement analytics: ${err.message}`, 'red');
    }
  }
}

async function seedStockMovements(produitsCrees, utilisateursCrees) {
  log('\n📦 Création des mouvements de stock...', 'blue');
  
  const userId = utilisateursCrees[0].id;
  
  const mouvements = [
    {
      product_id: produitsCrees[0].id,
      movement_type: 'in',
      quantity: 25,
      previous_stock: 0,
      new_stock: 25,
      reason: 'Stock initial',
      user_id: userId
    },
    {
      product_id: produitsCrees[1].id,
      movement_type: 'in',
      quantity: 12,
      previous_stock: 0,
      new_stock: 12,
      reason: 'Stock initial',
      user_id: userId
    },
    {
      product_id: produitsCrees[0].id,
      movement_type: 'out',
      quantity: 3,
      previous_stock: 25,
      new_stock: 22,
      reason: 'Vente',
      user_id: userId
    },
    {
      product_id: produitsCrees[2].id,
      movement_type: 'in',
      quantity: 8,
      previous_stock: 0,
      new_stock: 8,
      reason: 'Stock initial',
      user_id: userId
    },
    {
      product_id: produitsCrees[3].id,
      movement_type: 'in',
      quantity: 3,
      previous_stock: 0,
      new_stock: 3,
      reason: 'Stock initial',
      user_id: userId
    }
  ];
  
  for (const mouvement of mouvements) {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert(mouvement)
        .select()
        .single();

      if (error) {
        log(`❌ Erreur création mouvement stock: ${error.message}`, 'red');
      } else {
        log(`✅ Mouvement stock créé: ${mouvement.reason}`, 'green');
      }
    } catch (err) {
      log(`❌ Exception création mouvement stock: ${err.message}`, 'red');
    }
  }
}

async function main() {
  log('🌵 Démarrage du seeding des données de test...', 'yellow');
  
  try {
    // Créer les produits
    const produitsCrees = await seedProduits();
    
    // Créer les adresses (les utilisateurs doivent exister dans auth.users)
    // Utiliser le vrai UUID de l'utilisateur créé
    const utilisateursFictifs = [
      { id: "1896dce8-099a-402f-bf4b-1c6b89c0b431" },
      { id: "1896dce8-099a-402f-bf4b-1c6b89c0b431" }, // Réutiliser le même utilisateur pour les tests
      { id: "1896dce8-099a-402f-bf4b-1c6b89c0b431" }  // Réutiliser le même utilisateur pour les tests
    ];
    
    await seedAdresses(utilisateursFictifs);
    
    // Créer les commandes
    await seedCommandes(utilisateursFictifs);
    
    // Créer les avis
    await seedAvis(produitsCrees, utilisateursFictifs);
    
    // Créer les événements analytics
    await seedAnalytics();
    
    // Créer les mouvements de stock
    await seedStockMovements(produitsCrees, utilisateursFictifs);
    
    log('\n✨ Seeding terminé avec succès!', 'green');
    log('📋 Vous pouvez maintenant tester toutes les fonctionnalités.', 'blue');
    log('💡 Note: Les utilisateurs doivent être créés manuellement dans Supabase Auth.', 'yellow');
    
  } catch (error) {
    log(`❌ Erreur lors du seeding: ${error.message}`, 'red');
  }
}

main().catch(console.error); 