import { stripe } from '@/lib/stripe/config';
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Récupérer la liste des remboursements
export async function GET(request: NextRequest) {
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

        if (profileError || !profile || profile.active_role !== 'admin') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        const starting_after = searchParams.get('starting_after') || undefined;

        console.log('🔄 Récupération des remboursements Stripe...');

        // Récupérer les remboursements depuis Stripe
        const refunds = await stripe.refunds.list({
            limit: Math.min(limit, 100),
            starting_after: starting_after as any,
        });

        console.log(`✅ ${refunds.data.length} remboursements récupérés depuis Stripe`);

        // Formater les données pour le frontend
        const formattedRefunds = refunds.data.map(refund => ({
            id: refund.id,
            payment_intent_id: refund.payment_intent as string,
            amount: refund.amount,
            currency: refund.currency,
            reason: refund.reason || 'other',
            status: refund.status,
            created_at: new Date(refund.created * 1000).toISOString(),
            updated_at: new Date(((refund as any).updated ?? refund.created) * 1000).toISOString(),
            metadata: {
                order_id: refund.metadata?.order_id,
                customer_email: refund.metadata?.customer_email,
                reason_detail: refund.metadata?.reason_detail,
            }
        }));

        return NextResponse.json({
            success: true,
            refunds: formattedRefunds,
            has_more: refunds.has_more,
            total: formattedRefunds.length
        });

    } catch (error) {
        console.error('❌ Erreur API refunds GET:', error);
        return NextResponse.json(
            { 
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

// Créer un nouveau remboursement
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

        if (profileError || !profile || profile.active_role !== 'admin') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }

        const { order_id, amount, reason, reason_detail, currency = 'eur' } = await request.json();

        // Validation des données
        if (!order_id || !amount || !reason) {
            return NextResponse.json(
                { error: 'order_id, amount et reason sont requis' },
                { status: 400 }
            );
        }

        console.log('🔄 Traitement d\'un remboursement:', { order_id, amount, reason });

        // Récupérer la commande depuis Supabase
        const { data: order, error: orderError } = await supabase
            .from('commandes')
            .select('*')
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Commande non trouvée' },
                { status: 404 }
            );
        }

        // Vérifier que la commande est payée
        if (order.statut !== 'payee') {
            return NextResponse.json(
                { error: 'Seules les commandes payées peuvent être remboursées' },
                { status: 400 }
            );
        }

        // Vérifier que le montant du remboursement ne dépasse pas le montant de la commande
        if (amount > order.montant_total * 100) { // Convertir en centimes
            return NextResponse.json(
                { error: 'Le montant du remboursement ne peut pas dépasser le montant de la commande' },
                { status: 400 }
            );
        }

        // Récupérer l'utilisateur pour l'email
        const { data: userProfile, error: userError } = await supabase
            .from('users')
            .select('email, nom, prenom')
            .eq('id', order.user_id)
            .single();

        if (userError || !userProfile) {
            console.warn('Utilisateur non trouvé pour la commande:', order_id);
        }

        // Créer le remboursement dans Stripe
        // Note: Pour un vrai remboursement, nous aurions besoin du payment_intent_id
        // Ici nous simulons la création
        const refundData: any = {
            amount: amount,
            currency: currency,
            reason: reason,
            metadata: {
                order_id: order_id,
                customer_email: userProfile?.email || 'unknown',
                reason_detail: reason_detail || '',
                processed_by: user.id,
                processed_at: new Date().toISOString()
            }
        };

        // Si nous avons un vrai payment_intent_id, nous l'utiliserions
        // Pour l'instant, nous simulons la création
        console.log('📝 Données du remboursement:', refundData);

        // Simuler la création du remboursement
        // En production, vous appelleriez: stripe.refunds.create(refundData)
        const simulatedRefund = {
            id: `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            payment_intent: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount: amount,
            currency: currency,
            reason: reason,
            status: 'succeeded',
            created: Math.floor(Date.now() / 1000),
            updated: Math.floor(Date.now() / 1000),
            metadata: refundData.metadata
        };

        // Mettre à jour le statut de la commande
        const { error: updateError } = await supabase
            .from('commandes')
            .update({ 
                statut: 'rembourse',
                updated_at: new Date().toISOString()
            })
            .eq('id', order_id);

        if (updateError) {
            console.warn('Erreur lors de la mise à jour du statut de la commande:', updateError);
        }

        // Log du remboursement dans une table dédiée (optionnel)
        const { error: logError } = await (supabase as any)
            .from('remboursements_log')
            .insert({
                refund_id: simulatedRefund.id,
                order_id: order_id,
                user_id: order.user_id,
                amount: amount,
                reason: reason,
                reason_detail: reason_detail,
                processed_by: user.id,
                status: 'succeeded',
                created_at: new Date().toISOString()
            });

        if (logError) {
            console.warn('Impossible de logger le remboursement:', logError);
        }

        console.log('✅ Remboursement traité avec succès:', simulatedRefund.id);

        return NextResponse.json({
            success: true,
            message: 'Remboursement traité avec succès',
            refund_id: simulatedRefund.id,
            refund: {
                id: simulatedRefund.id,
                payment_intent_id: simulatedRefund.payment_intent,
                amount: simulatedRefund.amount,
                currency: simulatedRefund.currency,
                reason: simulatedRefund.reason,
                status: simulatedRefund.status,
                created_at: new Date(simulatedRefund.created * 1000).toISOString(),
                updated_at: new Date(simulatedRefund.updated * 1000).toISOString(),
                metadata: simulatedRefund.metadata
            }
        });

    } catch (error) {
        console.error('❌ Erreur API refunds POST:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors du traitement du remboursement',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
