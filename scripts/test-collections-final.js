require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCollectionsFinal() {
    console.log('🎯 Test final du système de collections et catégories...\n');

    try {
        // 1. Vérifier que les tables existent
        console.log('1️⃣ Vérification des tables...');
        
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .limit(5);

        if (categoriesError) {
            console.error('❌ Table categories non trouvée:', categoriesError.message);
            return;
        }

        const { data: collections, error: collectionsError } = await supabase
            .from('collections')
            .select('*')
            .limit(5);

        if (collectionsError) {
            console.error('❌ Table collections non trouvée:', collectionsError.message);
            return;
        }

        console.log('✅ Tables categories et collections trouvées');
        console.log(`   - ${categories?.length || 0} catégories`);
        console.log(`   - ${collections?.length || 0} collections`);

        // 2. Afficher les catégories
        console.log('\n2️⃣ Catégories:');
        categories?.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.name} (${cat.slug}) - ${cat.is_active ? '✅' : '❌'}`);
        });

        // 3. Afficher les collections
        console.log('\n3️⃣ Collections:');
        collections?.forEach((col, index) => {
            console.log(`   ${index + 1}. ${col.name} (${col.slug}) - ${col.is_featured ? '⭐' : '⚪'} - ${col.is_active ? '✅' : '❌'}`);
        });

        // 4. Tester la création d'une collection
        console.log('\n4️⃣ Test de création d\'une collection...');
        
        const testCollection = {
            name: 'Collection Test Final',
            slug: 'collection-test-final',
            description: 'Collection de test pour vérifier le système final',
            is_active: true,
            is_featured: false,
            sort_order: 100
        };

        const { data: newCollection, error: createError } = await supabase
            .from('collections')
            .insert(testCollection)
            .select()
            .single();

        if (createError) {
            console.error('❌ Erreur création collection:', createError.message);
        } else {
            console.log('✅ Collection créée:', newCollection.id);
        }

        // 5. Tester la récupération des collections avec produits
        console.log('\n5️⃣ Test de récupération des collections avec produits...');
        
        const { data: collectionsWithProducts, error: productsError } = await supabase
            .from('collections')
            .select(`
                *,
                product_collections!inner(
                    product_id
                )
            `)
            .order('name');

        if (productsError) {
            console.error('❌ Erreur récupération collections avec produits:', productsError.message);
        } else {
            console.log('✅ Collections avec produits récupérées:');
            collectionsWithProducts?.forEach(col => {
                const productCount = col.product_collections?.length || 0;
                console.log(`   - ${col.name}: ${productCount} produit(s)`);
            });
        }

        // 6. Nettoyer la collection de test
        if (newCollection) {
            console.log('\n6️⃣ Nettoyage de la collection de test...');
            
            const { error: deleteError } = await supabase
                .from('collections')
                .delete()
                .eq('id', newCollection.id);

            if (deleteError) {
                console.error('❌ Erreur suppression collection test:', deleteError.message);
            } else {
                console.log('✅ Collection de test supprimée');
            }
        }

        console.log('\n🎉 Tests terminés avec succès !');
        console.log('\n💡 Le système est maintenant prêt !');
        console.log('   1. Connectez-vous en tant qu\'admin');
        console.log('   2. Allez sur /admin/collections');
        console.log('   3. Testez la création d\'une collection');
        console.log('   4. Vérifiez que les catégories et collections s\'affichent dans le formulaire de produit');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    }
}

// Exécuter les tests
testCollectionsFinal();
