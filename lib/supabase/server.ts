import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Fonction pour créer un client serveur compatible avec tous les contextes
export const createServerClient = async () => {
  try {
    // Next.js 15+ rend cookies() asynchrone — on l'attend puis on passe un wrapper synchrone
    const nh = await import('next/headers');
    const cookieStore = await nh.cookies();
    const wrappedCookies = () => cookieStore;
    return createServerComponentClient<Database>({ cookies: wrappedCookies as any });
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