const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
    console.log('🧪 Test des APIs collections et catégories...\n');

    try {
        // Test de l'API des catégories
        console.log('1️⃣ Test de l\'API des catégories...');
        const categoriesResponse = await fetch(`${BASE_URL}/api/admin/categories`);
        
        if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            console.log('✅ API catégories fonctionne');
            console.log(`   - ${categoriesData.categories?.length || 0} catégories récupérées`);
        } else {
            console.log('❌ API catégories erreur:', categoriesResponse.status);
        }

        // Test de l'API des collections
        console.log('\n2️⃣ Test de l\'API des collections...');
        const collectionsResponse = await fetch(`${BASE_URL}/api/admin/collections`);
        
        if (collectionsResponse.ok) {
            const collectionsData = await collectionsResponse.json();
            console.log('✅ API collections fonctionne');
            console.log(`   - ${collectionsData.collections?.length || 0} collections récupérées`);
        } else {
            console.log('❌ API collections erreur:', collectionsResponse.status);
        }

        console.log('\n🎉 Tests terminés !');
        console.log('\n💡 Pour tester l\'interface:');
        console.log('   1. Connectez-vous en tant qu\'admin');
        console.log('   2. Allez sur /admin/collections');
        console.log('   3. Testez la création d\'une collection');
        console.log('   4. Vérifiez que les catégories et collections s\'affichent dans le formulaire de produit');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        console.log('\n💡 Assurez-vous que le serveur de développement est démarré (npm run dev)');
    }
}

// Exécuter les tests
testAPIs();
