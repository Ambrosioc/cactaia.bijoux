require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCategoriesSystem() {
    console.log('🎯 Test du système des catégories...\n');

    try {
        // 1. Vérifier que la table categories existe
        console.log('📊 Vérification de la table categories...');
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('*');

        if (categoriesError) {
            console.error('❌ Erreur table categories:', categoriesError);
            return;
        }

        console.log(`✅ ${categories.length} catégories trouvées dans la base:`);
        categories.forEach(cat => {
            console.log(`   - ${cat.name} (${cat.slug}) - Active: ${cat.is_active}`);
        });

        // 2. Créer une nouvelle catégorie de test
        console.log('\n📝 Création d\'une nouvelle catégorie de test...');
        const testCategory = {
            name: 'Test Catégorie',
            slug: 'test-categorie',
            description: 'Catégorie de test pour vérifier le système',
            is_active: true,
            sort_order: 100,
            meta_title: 'Test Catégorie - Cactaïa',
            meta_description: 'Description de test pour la catégorie'
        };

        const { data: newCategory, error: createError } = await supabase
            .from('categories')
            .insert(testCategory)
            .select()
            .single();

        if (createError) {
            console.error('❌ Erreur création catégorie:', createError);
            return;
        }

        console.log('✅ Catégorie de test créée:', newCategory.id);

        // 3. Vérifier la requête avec LEFT JOIN
        console.log('\n🔍 Test de la requête avec LEFT JOIN...');
        const { data: categoriesWithProducts, error: joinError } = await supabase
            .from('categories')
            .select(`
                *,
                product_categories(
                    product_id
                )
            `)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (joinError) {
            console.error('❌ Erreur requête LEFT JOIN:', joinError);
            return;
        }

        console.log(`✅ ${categoriesWithProducts.length} catégories avec LEFT JOIN:`);
        categoriesWithProducts.forEach(cat => {
            const productCount = cat.product_categories?.length || 0;
            console.log(`   - ${cat.name}: ${productCount} produit(s)`);
        });

        // 4. Nettoyage - supprimer la catégorie de test
        console.log('\n🧹 Nettoyage - suppression de la catégorie de test...');
        const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .eq('id', newCategory.id);

        if (deleteError) {
            console.error('❌ Erreur suppression catégorie de test:', deleteError);
        } else {
            console.log('✅ Catégorie de test supprimée');
        }

        console.log('\n🎉 Test terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

testCategoriesSystem();
