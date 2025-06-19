import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from './types';

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};

// Client spécial pour les webhooks (sans cookies)
export const createWebhookClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};