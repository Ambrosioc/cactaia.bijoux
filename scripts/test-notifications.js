require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNotifications() {
    console.log('🔔 Test du système de notifications...\n');

    try {
        // 1. Vérifier que la table notifications existe
        console.log('1️⃣ Vérification de la table notifications...');
        const { data: tableExists, error: tableError } = await supabase
            .from('notifications')
            .select('count', { count: 'exact', head: true });

        if (tableError) {
            console.error('❌ Table notifications non trouvée:', tableError.message);
            console.log('💡 Exécutez d\'abord la migration: supabase/migrations/20250117000000_create_notifications_table.sql');
            return;
        }

        console.log('✅ Table notifications trouvée');

        // 2. Créer des notifications de test
        console.log('\n2️⃣ Création de notifications de test...');

        const testNotifications = [
            {
                type: 'success',
                title: 'Nouveau paiement réussi',
                message: 'Un nouveau paiement de 89,90 € a été reçu.',
                metadata: {
                    order_id: 'test_order_001',
                    amount: 8990,
                    customer_email: 'test@example.com'
                },
                action_url: '/admin/paiements'
            },
            {
                type: 'warning',
                title: 'Stock faible',
                message: 'Le produit "Bracelet Cactaïa" a un stock faible (3 restants).',
                metadata: {
                    product_id: 'test_product_001',
                    product_name: 'Bracelet Cactaïa',
                    current_stock: 3,
                    threshold: 5
                },
                action_url: '/admin/stocks'
            },
            {
                type: 'error',
                title: 'Paiement échoué',
                message: 'Le paiement de 45,00 € a échoué: Carte refusée.',
                metadata: {
                    order_id: 'test_order_002',
                    amount: 4500,
                    customer_email: 'client@example.com'
                },
                action_url: '/admin/paiements'
            },
            {
                type: 'info',
                title: 'Nouvelle commande',
                message: 'Une nouvelle commande de 67,50 € a été passée.',
                metadata: {
                    order_id: 'test_order_003',
                    amount: 6750,
                    customer_email: 'nouveau@example.com'
                },
                action_url: '/admin/commandes'
            }
        ];

        for (const notification of testNotifications) {
            const { data, error } = await supabase
                .from('notifications')
                .insert(notification)
                .select()
                .single();

            if (error) {
                console.error(`❌ Erreur création notification "${notification.title}":`, error.message);
            } else {
                console.log(`✅ Notification créée: ${notification.title}`);
            }
        }

        // 3. Vérifier les notifications créées
        console.log('\n3️⃣ Vérification des notifications créées...');
        const { data: notifications, error: fetchError } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('❌ Erreur récupération notifications:', fetchError.message);
            return;
        }

        console.log(`✅ ${notifications.length} notifications trouvées:`);
        notifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. [${notif.type.toUpperCase()}] ${notif.title}`);
            console.log(`      ${notif.message}`);
            console.log(`      Métadonnées:`, JSON.stringify(notif.metadata, null, 2));
            console.log(`      Lu: ${notif.read ? 'Oui' : 'Non'}`);
            console.log('');
        });

        // 4. Tester les statistiques
        console.log('4️⃣ Calcul des statistiques...');
        const totalCount = notifications.length;
        const unreadCount = notifications.filter(n => !n.read).length;
        const typeCounts = {
            success: notifications.filter(n => n.type === 'success').length,
            warning: notifications.filter(n => n.type === 'warning').length,
            error: notifications.filter(n => n.type === 'error').length,
            info: notifications.filter(n => n.type === 'info').length
        };

        console.log('📊 Statistiques:');
        console.log(`   Total: ${totalCount}`);
        console.log(`   Non lues: ${unreadCount}`);
        console.log(`   Par type:`);
        Object.entries(typeCounts).forEach(([type, count]) => {
            console.log(`     ${type}: ${count}`);
        });

        // 5. Tester le marquage comme lu
        console.log('\n5️⃣ Test du marquage comme lu...');
        if (notifications.length > 0) {
            const firstNotification = notifications[0];
            const { error: updateError } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', firstNotification.id);

            if (updateError) {
                console.error('❌ Erreur marquage comme lu:', updateError.message);
            } else {
                console.log(`✅ Notification "${firstNotification.title}" marquée comme lue`);
            }
        }

        // 6. Tester la suppression
        console.log('\n6️⃣ Test de la suppression...');
        if (notifications.length > 1) {
            const notificationToDelete = notifications[1];
            const { error: deleteError } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationToDelete.id);

            if (deleteError) {
                console.error('❌ Erreur suppression:', deleteError.message);
            } else {
                console.log(`✅ Notification "${notificationToDelete.title}" supprimée`);
            }
        }

        console.log('\n🎉 Tests terminés avec succès !');
        console.log('\n💡 Pour tester l\'interface:');
        console.log('   1. Connectez-vous en tant qu\'admin');
        console.log('   2. Cliquez sur l\'icône de cloche dans le header');
        console.log('   3. Vérifiez que les notifications s\'affichent correctement');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    }
}

// Exécuter les tests
testNotifications();
