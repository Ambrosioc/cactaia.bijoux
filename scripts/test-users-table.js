require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUsersTable() {
    console.log('🎯 Test de la table users...\n');

    try {
        // 1. Vérifier la structure de la table users
        console.log('1️⃣ Structure de la table users...');
        const { data: columns, error: columnsError } = await supabase
            .rpc('get_table_columns', { table_name: 'users' });

        if (columnsError) {
            console.log('❌ Erreur récupération colonnes:', columnsError);
            
            // Essayer une autre approche
            const { data: tableInfo, error: tableError } = await supabase
                .from('users')
                .select('*')
                .limit(0);
            
            if (tableError) {
                console.error('❌ Erreur accès table users:', tableError);
                return;
            }
            
            console.log('✅ Table users accessible');
        } else {
            console.log('✅ Colonnes de la table users:');
            columns.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
            });
        }

        // 2. Tester l'insertion d'un utilisateur de test
        console.log('\n2️⃣ Test d\'insertion d\'un utilisateur...');
        
        const testUser = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'test@example.com',
            nom: 'Test',
            prenom: 'User',
            genre: 'Homme',
            date_naissance: '1990-01-01',
            cgv_accepted: true,
            cgv_accepted_at: new Date().toISOString(),
            newsletter: false,
            profile_completed: true,
            active_role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert(testUser)
            .select()
            .single();

        if (insertError) {
            console.error('❌ Erreur insertion:', insertError);
            
            // Essayer d'identifier le problème
            if (insertError.code === '23502') {
                console.log('💡 Erreur NOT NULL - une colonne obligatoire est manquante');
            } else if (insertError.code === '42703') {
                console.log('💡 Erreur colonne inexistante');
            } else if (insertError.code === '23514') {
                console.log('💡 Erreur contrainte de validation');
            }
            
            return;
        }

        console.log('✅ Utilisateur inséré avec succès:', insertData.id);

        // 3. Nettoyage
        console.log('\n3️⃣ Nettoyage...');
        await supabase.from('users').delete().eq('id', testUser.id);
        console.log('✅ Utilisateur de test supprimé');

        console.log('\n🎉 Test terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

// Exécuter le test
testUsersTable();
