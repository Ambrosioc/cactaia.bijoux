import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        
        // Vérifier l'authentification admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Vérifier le rôle admin
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role, active_role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Erreur lors de la récupération du profil:', profileError);
            return NextResponse.json({ error: 'Erreur de profil utilisateur' }, { status: 500 });
        }

        if (!profile || profile.active_role !== 'admin') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }

        // Récupérer les données de la requête
        const { type, subject, content, userIds, promotionCode } = await request.json();

        if (!subject || !content) {
            return NextResponse.json({ error: 'Sujet et contenu requis' }, { status: 400 });
        }

        console.log('📧 Envoi d\'email:', { type, subject, userIds: userIds?.length, promotionCode });

        type TargetUser = { id: string; email: string; nom?: string | null; prenom?: string | null };
        let targetUsers: TargetUser[] = [];

        if (type === 'individual' && userIds && userIds.length > 0) {
            // Récupérer les utilisateurs spécifiés
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, email, nom, prenom')
                .in('id', userIds);

            if (usersError) {
                console.error('Erreur lors de la récupération des utilisateurs:', usersError);
                return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
            }

            targetUsers = (users || []) as TargetUser[];
        } else if (type === 'group') {
            // Récupérer tous les utilisateurs actifs
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, email, nom, prenom')
                .not('email', 'is', null);

            if (usersError) {
                console.error('Erreur lors de la récupération des utilisateurs:', usersError);
                return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
            }

            targetUsers = (users || []) as TargetUser[];
        }

        if (targetUsers.length === 0) {
            return NextResponse.json({ error: 'Aucun utilisateur cible trouvé' }, { status: 400 });
        }

        // Récupérer les informations du code promotionnel si spécifié
        let promotionInfo = null;
        if (promotionCode) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/promotion-codes/${promotionCode}`);
                if (response.ok) {
                    const data = await response.json();
                    promotionInfo = data.promotionCode;
                }
            } catch (error) {
                console.warn('Impossible de récupérer les informations du code promotionnel:', error);
            }
        }

        // Préparer le contenu de l'email avec le code promotionnel si applicable
        let emailContent = content;
        if (promotionInfo) {
            emailContent += `\n\n🎉 Code promotionnel: ${promotionInfo.code}\n`;
            emailContent += `Réduction: ${promotionInfo.discount_value}`;
            emailContent += promotionInfo.discount_type === 'percentage' ? '%' : '€';
            if (promotionInfo.valid_until) {
                emailContent += `\nValide jusqu'au: ${new Date(promotionInfo.valid_until).toLocaleDateString('fr-FR')}`;
            }
        }

        // Envoyer les emails (simulation pour l'instant)
        const emailPromises = targetUsers.map(async (user) => {
            try {
                // Ici vous intégreriez votre service d'email (Mailjet, SendGrid, etc.)
                console.log(`📧 Email envoyé à ${user.email}: ${subject}`);
                
                // Log de l'email dans la base de données
                const { error: logError } = await supabase
                    .from('email_logs')
                    .insert({
                        user_id: user.id,
                        recipient: user.email,
                        subject: subject,
                        email_type: typeof type === 'string' ? type : 'bulk',
                        success: true,
                        details: {
                            promotion_code: promotionCode || null,
                            content: emailContent
                        }
                    });

                if (logError) {
                    console.warn('Impossible de logger l\'email:', logError);
                }

                return { success: true, email: user.email };
            } catch (error: any) {
                console.error(`Erreur lors de l'envoi à ${user.email}:`, error);
                return { success: false, email: user.email, error: error?.message };
            }
        });

        const results = await Promise.all(emailPromises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`✅ ${successful} emails envoyés avec succès, ${failed} échecs`);

        return NextResponse.json({
            success: true,
            message: `${successful} email(s) envoyé(s) avec succès`,
            total: targetUsers.length,
            successful,
            failed,
            results
        });

    } catch (error) {
        console.error('❌ Erreur API send-email:', error);
        return NextResponse.json(
            { 
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
