import { handleWebhook } from '@/lib/stripe/webhookHandler';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return handleWebhook(request);
}