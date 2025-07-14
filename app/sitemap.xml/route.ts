import { generateSitemap } from '@/lib/seo/sitemap';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sitemap = await generateSitemap();
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache 1 heure
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    return new NextResponse('Erreur lors de la génération du sitemap', { status: 500 });
  }
} 