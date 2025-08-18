require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCollectionsAPI() {
    console.log('🎯 Test de l\'API des collections...\n');

    try {
        // 1. Vérifier que la table collections existe et contient des données
        console.log('📊 Vérification de la table collections...');
        const { data: collections, error: collectionsError } = await supabase
            .from('collections')
            .select('*');

        if (collectionsError) {
            console.error('❌ Erreur table collections:', collectionsError);
            return;
        }

        console.log(`✅ ${collections.length} collections trouvées dans la base:`);
        collections.forEach(col => {
            console.log(`   - ${col.name} (${col.slug}) - Active: ${col.is_active}`);
        });

        // 2. Vérifier la table product_collections
        console.log('\n📊 Vérification de la table product_collections...');
        const { data: productCollections, error: pcError } = await supabase
            .from('product_collections')
            .select('*');

        if (pcError) {
            console.error('❌ Erreur table product_collections:', pcError);
        } else {
            console.log(`✅ ${productCollections.length} associations produit-collection trouvées`);
        }

        // 3. Test de la requête avec LEFT JOIN
        console.log('\n🔍 Test de la requête avec LEFT JOIN...');
        const { data: collectionsWithProducts, error: joinError } = await supabase
            .from('collections')
            .select(`
                *,
                product_collections(
                    product_id
                )
            `)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (joinError) {
            console.error('❌ Erreur requête LEFT JOIN:', joinError);
            return;
        }

        console.log(`✅ ${collectionsWithProducts.length} collections avec LEFT JOIN:`);
        collectionsWithProducts.forEach(col => {
            const productCount = col.product_collections?.length || 0;
            console.log(`   - ${col.name}: ${productCount} produit(s)`);
        });

        console.log('\n🎉 Test terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

testCollectionsAPI();
