require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCollectionsSimple() {
    console.log('🧪 Test simple du système de collections...\n');

    try {
        // 1. Vérifier que les tables existent
        console.log('1️⃣ Vérification des tables...');
        
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .limit(3);

        if (categoriesError) {
            console.error('❌ Erreur catégories:', categoriesError.message);
            return;
        }

        const { data: collections, error: collectionsError } = await supabase
            .from('collections')
            .select('*')
            .limit(3);

        if (collectionsError) {
            console.error('❌ Erreur collections:', collectionsError.message);
            return;
        }

        console.log('✅ Tables trouvées:');
        console.log(`   - ${categories?.length || 0} catégories`);
        console.log(`   - ${collections?.length || 0} collections`);

        // 2. Afficher quelques exemples
        if (categories?.length > 0) {
            console.log('\n2️⃣ Exemples de catégories:');
            categories.forEach((cat, index) => {
                console.log(`   ${index + 1}. ${cat.name} (${cat.slug})`);
            });
        }

        if (collections?.length > 0) {
            console.log('\n3️⃣ Exemples de collections:');
            collections.forEach((col, index) => {
                console.log(`   ${index + 1}. ${col.name} (${col.slug})`);
            });
        }

        console.log('\n🎉 Test terminé avec succès !');
        console.log('\n💡 Le système est prêt pour l\'interface admin !');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Exécuter le test
testCollectionsSimple();
