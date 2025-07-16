#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Données fictives pour les utilisateurs (pour les avis)
const usersData = [
  {
    email: 'marie.dupont@example.com',
    nom: 'Dupont',
    prenom: 'Marie',
    role: 'user'
  },
  {
    email: 'sophie.martin@example.com',
    nom: 'Martin',
    prenom: 'Sophie',
    role: 'user'
  },
  {
    email: 'julie.bernard@example.com',
    nom: 'Bernard',
    prenom: 'Julie',
    role: 'user'
  },
  {
    email: 'camille.petit@example.com',
    nom: 'Petit',
    prenom: 'Camille',
    role: 'user'
  },
  {
    email: 'laura.robert@example.com',
    nom: 'Robert',
    prenom: 'Laura',
    role: 'user'
  },
  {
    email: 'emma.richard@example.com',
    nom: 'Richard',
    prenom: 'Emma',
    role: 'user'
  },
  {
    email: 'chloe.durand@example.com',
    nom: 'Durand',
    prenom: 'Chloé',
    role: 'user'
  },
  {
    email: 'lisa.leroy@example.com',
    nom: 'Leroy',
    prenom: 'Lisa',
    role: 'user'
  },
  {
    email: 'jade.moreau@example.com',
    nom: 'Moreau',
    prenom: 'Jade',
    role: 'user'
  },
  {
    email: 'zoé.simon@example.com',
    nom: 'Simon',
    prenom: 'Zoé',
    role: 'user'
  }
];

// Données fictives pour les avis
const reviewsData = [
  {
    rating: 5,
    title: "Magnifique bijou !",
    comment: "Je suis vraiment ravie de mon achat. La qualité est exceptionnelle et le design est unique. Je recommande vivement !",
    is_verified_purchase: true
  },
  {
    rating: 4,
    title: "Très satisfaite",
    comment: "Un beau produit, bien fini. La livraison était rapide et l'emballage soigné. Je recommande.",
    is_verified_purchase: true
  },
  {
    rating: 5,
    title: "Parfait pour un cadeau",
    comment: "J'ai offert ce bijou à ma sœur et elle l'adore ! Le style est élégant et original. Très bonne qualité.",
    is_verified_purchase: true
  },
  {
    rating: 4,
    title: "Joli design",
    comment: "Le design est vraiment original et le prix est correct pour la qualité. Je suis contente de mon achat.",
    is_verified_purchase: false
  },
  {
    rating: 5,
    title: "Excellente qualité",
    comment: "La finition est parfaite et le matériau est de très bonne qualité. Je recommande sans hésitation !",
    is_verified_purchase: true
  },
  {
    rating: 3,
    title: "Correct",
    comment: "Le produit est joli mais un peu plus petit que ce que j'imaginais. La qualité est correcte pour le prix.",
    is_verified_purchase: true
  },
  {
    rating: 5,
    title: "Coup de cœur !",
    comment: "J'adore ce bijou ! Il est parfait pour toutes les occasions et reçoit beaucoup de compliments.",
    is_verified_purchase: true
  },
  {
    rating: 4,
    title: "Très belle pièce",
    comment: "Un design unique et élégant. La qualité est au rendez-vous et le service client est impeccable.",
    is_verified_purchase: true
  },
  {
    rating: 5,
    title: "Au-delà de mes attentes",
    comment: "Je ne m'attendais pas à une telle qualité ! Le bijou est encore plus beau en vrai qu'en photo.",
    is_verified_purchase: true
  },
  {
    rating: 4,
    title: "Style original",
    comment: "J'aime beaucoup le style unique de ce bijou. Il se démarque vraiment des autres. Bonne qualité.",
    is_verified_purchase: false
  },
  {
    rating: 5,
    title: "Parfait !",
    comment: "Exactement ce que je cherchais. La qualité est exceptionnelle et le design est magnifique.",
    is_verified_purchase: true
  },
  {
    rating: 4,
    title: "Très satisfaite",
    comment: "Un beau produit avec un style original. La livraison était parfaite et le service client réactif.",
    is_verified_purchase: true
  },
  {
    rating: 5,
    title: "Coup de cœur",
    comment: "J'adore ce bijou ! Il est parfait pour compléter mes tenues et reçoit beaucoup de compliments.",
    is_verified_purchase: true
  },
  {
    rating: 4,
    title: "Belle qualité",
    comment: "La qualité est au rendez-vous et le design est élégant. Je recommande ce produit.",
    is_verified_purchase: true
  },
  {
    rating: 5,
    title: "Exceptionnel",
    comment: "Un bijou magnifique avec une finition parfaite. Le service client est également excellent.",
    is_verified_purchase: true
  }
];

async function createUsers() {
  console.log('👥 Création des utilisateurs fictifs...');
  
  const createdUsers = [];
  
  for (const userData of usersData) {
    try {
      // Créer l'utilisateur dans auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: 'password123',
        email_confirm: true
      });

      if (authError) {
        console.log(`⚠️ Utilisateur ${userData.email} déjà existant ou erreur:`, authError.message);
        continue;
      }

      // Créer l'entrée dans public.users
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: userData.email,
          nom: userData.nom,
          prenom: userData.prenom,
          role: userData.role,
          profile_completed: true
        })
        .select()
        .single();

      if (publicError) {
        console.log(`⚠️ Erreur création profil ${userData.email}:`, publicError.message);
        continue;
      }

      createdUsers.push(publicUser);
      console.log(`✅ Utilisateur créé: ${userData.prenom} ${userData.nom}`);
      
    } catch (error) {
      console.log(`❌ Erreur pour ${userData.email}:`, error.message);
    }
  }

  return createdUsers;
}

async function getProducts() {
  console.log('📦 Récupération des produits...');
  
  const { data: products, error } = await supabase
    .from('produits')
    .select('id, nom')
    .eq('est_actif', true);

  if (error) {
    throw error;
  }

  console.log(`✅ ${products.length} produits récupérés`);
  return products;
}

async function createReviews(users, products) {
  console.log('⭐ Création des avis...');
  
  let reviewsCreated = 0;
  
  // Créer plusieurs avis par produit
  for (const product of products) {
    // Sélectionner aléatoirement 3-8 avis par produit
    const numReviews = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < numReviews; i++) {
      try {
        const user = users[Math.floor(Math.random() * users.length)];
        const review = reviewsData[Math.floor(Math.random() * reviewsData.length)];
        
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            product_id: product.id,
            user_id: user.id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            status: 'approved', // Tous les avis sont approuvés pour les tests
            is_verified_purchase: review.is_verified_purchase,
            helpful_votes: Math.floor(Math.random() * 10),
            total_votes: Math.floor(Math.random() * 15) + 5
          });

        if (error) {
          console.log(`⚠️ Erreur avis pour ${product.nom}:`, error.message);
          continue;
        }

        reviewsCreated++;
        
        // Créer quelques votes utiles/pas utiles
        if (Math.random() > 0.5) {
          const numVotes = Math.floor(Math.random() * 3) + 1;
          for (let j = 0; j < numVotes; j++) {
            const voter = users[Math.floor(Math.random() * users.length)];
            await supabase
              .from('review_votes')
              .insert({
                review_id: data[0].id,
                user_id: voter.id,
                is_helpful: Math.random() > 0.3 // 70% de votes utiles
              })
              .catch(() => {}); // Ignorer les erreurs de doublons
          }
        }
        
      } catch (error) {
        console.log(`❌ Erreur création avis:`, error.message);
      }
    }
    
    console.log(`✅ ${numReviews} avis créés pour ${product.nom}`);
  }
  
  return reviewsCreated;
}

async function seedReviews() {
  console.log('🌱 Début du seeding des avis...');

  try {
    // Créer les utilisateurs
    const users = await createUsers();
    
    if (users.length === 0) {
      console.log('⚠️ Aucun utilisateur créé, utilisation des utilisateurs existants...');
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id, nom, prenom')
        .limit(10);
      
      if (existingUsers && existingUsers.length > 0) {
        users.push(...existingUsers);
      } else {
        throw new Error('Aucun utilisateur disponible pour créer des avis');
      }
    }

    // Récupérer les produits
    const products = await getProducts();
    
    if (products.length === 0) {
      throw new Error('Aucun produit trouvé');
    }

    // Créer les avis
    const reviewsCreated = await createReviews(users, products);

    console.log(`\n🎉 Seeding terminé !`);
    console.log(`📊 Résumé:`);
    console.log(`   - Utilisateurs: ${users.length}`);
    console.log(`   - Produits: ${products.length}`);
    console.log(`   - Avis créés: ${reviewsCreated}`);

  } catch (error) {
    console.error('❌ Erreur lors du seeding des avis:', error);
  }
}

// Exécuter le seeding
seedReviews(); 