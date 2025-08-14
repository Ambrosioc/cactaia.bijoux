'use client';

import HeroImage from '@/components/ui/hero-image';
import { useSession } from '@/lib/hooks/useSession';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/compte';
  const supabase = createClient();
  const { refreshUser } = useUser();
  const { session, loading: sessionLoading, isAdmin, isUser } = useSession();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!sessionLoading && session) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push(redirectTo);
      }
    }
  }, [session, sessionLoading, isAdmin, isUser, router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Email ou mot de passe incorrect');
        return;
      }

      // Rafraîchir le profil utilisateur dans le store
      await refreshUser();

      // La redirection sera gérée par le useEffect ci-dessus
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Afficher un loader pendant la vérification de session
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  // Ne rien afficher si déjà connecté (redirection en cours)
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <HeroImage
          src="/images/cactaïa-07.jpg"
          alt="Bijoux Cactaia"
          priority
          zoomEffect={true}
          zoomIntensity="medium"
          overlayOpacity={0.2}
          showGradient={true}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center text-white p-8"
          >
            <h2 className="text-4xl font-light mb-4">Des bijoux qui vous ressemblent</h2>
            <p className="text-lg text-white/90 max-w-md">
              Découvrez notre collection de bijoux écoresponsables, mixtes et élégants
            </p>
          </motion.div>
        </HeroImage>
      </div>

      {/* Section droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo Cactaia (petit) */}
          <div className="text-center mb-8">
            <div className="w-32 h-12 relative mx-auto mb-6">
              <Image
                src="/CACTAIA LOGO_CACTAIA LOGO TERRA-07.png"
                alt="Cactaia Bijoux Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">Bienvenue</h1>
            <p className="text-gray-600">
              Connectez-vous à votre compte pour continuer
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 px-6 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Pas encore de compte ?{' '}
              <Link href="/inscription" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Liens utiles */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="/contact" className="text-gray-500 hover:text-primary transition-colors">
                Besoin d&apos;aide ?
              </Link>
              <Link href="/collections" className="text-gray-500 hover:text-primary transition-colors">
                Découvrir nos bijoux
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-32 h-12 bg-gray-200 rounded mx-auto mb-6"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-14 bg-gray-200 rounded-xl"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
              <div className="h-14 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-14 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 bg-gray-200"></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}