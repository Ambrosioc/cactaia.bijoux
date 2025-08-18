import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const tags = Array.isArray(body?.tags) ? (body.tags as string[]) : [];
    for (const t of tags) revalidateTag(t);
    return NextResponse.json({ revalidated: true, tags });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}


