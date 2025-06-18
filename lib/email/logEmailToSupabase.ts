import { createServerClient } from '@/lib/supabase/server';

interface LogEmailParams {
  userId: string;
  orderId?: string;
  emailType: string;
  recipient: string;
  subject: string;
  success: boolean;
  messageId?: string;
  error?: any;
  details?: any;
}

export async function logEmailToSupabase({
  userId,
  orderId,
  emailType,
  recipient,
  subject,
  success,
  messageId,
  error,
  details
}: LogEmailParams) {
  try {
    const supabase = createServerClient();
    
    // Vérifier si un log existe déjà pour éviter les doublons
    if (orderId && emailType) {
      const { data: existingLog } = await supabase
        .from('email_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('order_id', orderId)
        .eq('email_type', emailType)
        .eq('success', true)
        .maybeSingle();
      
      // Si un email réussi existe déjà, ne pas renvoyer
      if (existingLog && success) {
        console.log(`Email ${emailType} déjà envoyé pour la commande ${orderId}`);
        return { id: existingLog.id, alreadyLogged: true };
      }
    }
    
    // Insérer le log
    const { data, error: insertError } = await supabase
      .from('email_logs')
      .insert({
        user_id: userId,
        order_id: orderId,
        email_type: emailType,
        recipient,
        subject,
        success,
        message_id: messageId,
        error: error ? JSON.stringify(error) : null,
        details: details || null
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Erreur lors de l\'enregistrement du log d\'email:', insertError);
      return { success: false, error: insertError };
    }
    
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du log d\'email:', error);
    return { success: false, error };
  }
}