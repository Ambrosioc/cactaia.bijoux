import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Fonction pour créer un client serveur compatible avec tous les contextes
export const createServerClient = async () => {
  try {
    // Essayer d'importer cookies seulement si on est dans un Server Component
    const { cookies } = await import('next/headers');
    return createServerComponentClient<Database>({ cookies });
  } catch (error) {
    // Fallback pour les contextes où next/headers n'est pas disponible
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
};

// Client spécial pour les webhooks (sans cookies)
export const createWebhookClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};