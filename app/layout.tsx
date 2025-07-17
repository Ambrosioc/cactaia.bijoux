import ServiceWorkerInitializer from '@/components/client/service-worker-initializer';
import ConditionalFooter from '@/components/layout/conditional-footer';
import Header from '@/components/layout/header';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { ThemeProvider as ColorThemeProvider } from '@/lib/contexts/ThemeContext';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: 'Cactaïa - Bijoux durables et porteurs de sens',
    template: '%s | Cactaïa'
  },
  description: 'Découvrez notre collection de bijoux durables inspirés par la beauté du désert. Chaque pièce est conçue pour vous accompagner dans le temps, alliant élégance et simplicité.',
  keywords: ['bijoux', 'durables', 'désert', 'élégance', 'cactus', 'accessoires', 'mode'],
  authors: [{ name: 'Cactaïa' }],
  creator: 'Cactaïa',
  publisher: 'Cactaïa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cactaia.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://cactaia.fr',
    title: 'Cactaïa - Bijoux durables et porteurs de sens',
    description: 'Découvrez notre collection de bijoux durables inspirés par la beauté du désert.',
    siteName: 'Cactaïa',
    images: [
      {
        url: '/images/cactaïa-01.jpg',
        width: 1200,
        height: 630,
        alt: 'Cactaïa - Collection de bijoux',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cactaïa - Bijoux durables et porteurs de sens',
    description: 'Découvrez notre collection de bijoux durables inspirés par la beauté du désert.',
    images: ['/images/cactaïa-01.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className="light">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          <ColorThemeProvider>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <ConditionalFooter />
              </div>
            </AuthProvider>
          </ColorThemeProvider>
        </ThemeProvider>
        <ServiceWorkerInitializer />
      </body>
    </html>
  );
}