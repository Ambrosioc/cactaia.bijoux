require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProductForm() {
    console.log('🎯 Test du formulaire de produit...\n');

    try {
        // 1. Récupérer les catégories
        console.log('1️⃣ Récupération des catégories...');
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (categoriesError) {
            console.error('❌ Erreur catégories:', categoriesError);
            return;
        }

        console.log(`✅ ${categories.length} catégories trouvées:`);
        categories.forEach(cat => {
            console.log(`   - ${cat.name} (${cat.slug})`);
        });

        // 2. Récupérer les collections
        console.log('\n2️⃣ Récupération des collections...');
        const { data: collections, error: collectionsError } = await supabase
            .from('collections')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (collectionsError) {
            console.error('❌ Erreur collections:', collectionsError);
            return;
        }

        console.log(`✅ ${collections.length} collections trouvées:`);
        collections.forEach(col => {
            const featured = col.is_featured ? '⭐' : '⚪';
            console.log(`   - ${col.name} (${col.slug}) - ${featured}`);
        });

        // 3. Vérifier qu'on peut créer un produit avec ces catégories/collections
        console.log('\n3️⃣ Test de création d\'un produit de test...');
        
        // Créer un produit de test
        const { data: product, error: productError } = await supabase
            .from('produits')
            .insert({
                nom: 'Produit de test - Collections',
                description: 'Produit de test pour vérifier le système de collections et catégories',
                prix: 29.99,
                sku: 'TEST-COLL-001',
                stock: 10,
                est_actif: true,
                categorie: 'accessoires', // Ajouter la catégorie obligatoire
                slug: 'produit-test-collections' // Ajouter le slug obligatoire
            })
            .select()
            .single();

        if (productError) {
            console.error('❌ Erreur création produit:', productError);
            return;
        }

        console.log(`✅ Produit créé: ${product.nom} (ID: ${product.id})`);

        // 4. Associer le produit à une catégorie
        console.log('\n4️⃣ Association à une catégorie...');
        const { error: catLinkError } = await supabase
            .from('product_categories')
            .insert({
                product_id: product.id,
                category_id: categories[0].id
            });

        if (catLinkError) {
            console.error('❌ Erreur association catégorie:', catLinkError);
        } else {
            console.log(`✅ Produit associé à la catégorie: ${categories[0].name}`);
        }

        // 5. Associer le produit à une collection
        console.log('\n5️⃣ Association à une collection...');
        const { error: colLinkError } = await supabase
            .from('product_collections')
            .insert({
                product_id: product.id,
                collection_id: collections[0].id,
                sort_order: 1
            });

        if (colLinkError) {
            console.error('❌ Erreur association collection:', colLinkError);
        } else {
            console.log(`✅ Produit associé à la collection: ${collections[0].name}`);
        }

        // 6. Vérifier les associations
        console.log('\n6️⃣ Vérification des associations...');
        const { data: productWithRelations, error: relationsError } = await supabase
            .from('produits')
            .select(`
                *,
                product_categories!inner(
                    category_id,
                    categories!inner(name, slug)
                ),
                product_collections!inner(
                    collection_id,
                    collections!inner(name, slug)
                )
            `)
            .eq('id', product.id);

        if (relationsError) {
            console.error('❌ Erreur récupération relations:', relationsError);
        } else {
            console.log('✅ Relations récupérées avec succès:');
            console.log('   Catégories:', productWithRelations[0].product_categories.map(pc => pc.categories.name));
            console.log('   Collections:', productWithRelations[0].product_collections.map(pc => pc.collections.name));
        }

        // 7. Nettoyage
        console.log('\n7️⃣ Nettoyage...');
        await supabase.from('product_categories').delete().eq('product_id', product.id);
        await supabase.from('product_collections').delete().eq('product_id', product.id);
        await supabase.from('produits').delete().eq('id', product.id);
        console.log('✅ Produit de test supprimé');

        console.log('\n🎉 Test terminé avec succès !');
        console.log('💡 Le formulaire de produit peut maintenant utiliser les catégories et collections');

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

// Exécuter le test
testProductForm();
