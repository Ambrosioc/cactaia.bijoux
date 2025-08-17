require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSignupAPI() {
    console.log('🎯 Test de l\'API d\'inscription...\n');

    try {
        // 1. Tester la création d'un utilisateur auth
        console.log('1️⃣ Test création utilisateur auth...');
        
        const testEmail = `test${Date.now()}@example.com`;
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: testEmail,
            password: '123456',
        });

        if (authError) {
            console.error('❌ Erreur création auth:', authError);
            return;
        }

        if (!authData.user) {
            console.error('❌ Pas d\'utilisateur créé dans auth');
            return;
        }

        console.log('✅ Utilisateur auth créé:', authData.user.id);

        // 2. Attendre un peu
        console.log('\n2️⃣ Attente de 2 secondes...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Vérifier que l'utilisateur existe dans auth.users
        console.log('\n3️⃣ Vérification dans auth.users...');
        const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(authData.user.id);
        
        if (authUserError) {
            console.error('❌ Erreur récupération auth user:', authUserError);
        } else {
            console.log('✅ Utilisateur trouvé dans auth.users');
        }

        // 3.5. Vérifier si l'utilisateur existe déjà dans la table users
        console.log('\n3️⃣.5️⃣ Vérification dans table users...');
        const { data: existingUser, error: existingUserError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        
        if (existingUserError && existingUserError.code !== 'PGRST116') {
            console.error('❌ Erreur vérification table users:', existingUserError);
        } else if (existingUser) {
            console.log('⚠️ Utilisateur existe déjà dans table users, suppression...');
            await supabase.from('users').delete().eq('id', authData.user.id);
            console.log('✅ Utilisateur supprimé de la table users');
        } else {
            console.log('✅ Utilisateur n\'existe pas dans table users');
        }

        // 4. Tester l'insertion dans la table users
        console.log('\n4️⃣ Test insertion dans table users...');
        
        const userProfile = {
            id: authData.user.id,
            email: testEmail,
            nom: 'Test',
            prenom: 'User',
            genre: 'Homme',
            date_naissance: '1990-01-01',
            cgv_accepted: true,
            cgv_accepted_at: new Date().toISOString(),
            newsletter: false,
            profile_completed: true,
            active_role: 'user'
        };

        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .insert(userProfile)
            .select()
            .single();

        if (profileError) {
            console.error('❌ Erreur insertion profil:', profileError);
            
            // Analyser l'erreur
            if (profileError.code === '23503') {
                console.log('💡 Erreur clé étrangère - l\'utilisateur n\'existe pas dans auth.users');
            } else if (profileError.code === '23502') {
                console.log('💡 Erreur NOT NULL - colonne obligatoire manquante');
            } else if (profileError.code === '42703') {
                console.log('💡 Erreur colonne inexistante');
            }
            
            return;
        }

        console.log('✅ Profil utilisateur créé:', profileData.id);

        // 5. Nettoyage
        console.log('\n5️⃣ Nettoyage...');
        
        // Supprimer le profil
        await supabase.from('users').delete().eq('id', authData.user.id);
        console.log('✅ Profil supprimé');
        
        // Supprimer l'utilisateur auth
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('✅ Utilisateur auth supprimé');

        console.log('\n🎉 Test terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

// Exécuter le test
testSignupAPI();
