"use client"

import NotificationsPanel from '@/components/admin/notifications-panel';
import CartSidebar from '@/components/cart/cart-sidebar';
import CategorySidebar from '@/components/layout/category-sidebar';
import { useWishlist } from '@/hooks/use-wishlist';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useCart } from '@/stores/cartStore';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categorySidebarOpen, setCategorySidebarOpen] = useState(false);
  const { user, isAuthenticated, displayName } = useUser();
  const { totalItems, toggleCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme } = useTheme();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Liste des pages où le header doit toujours être Terra Cotta
  const terraCottaPages = [
    '/cgv',
    '/retours',
    '/livraison',
    '/mentions-legales',
    '/faq',
    '/contact',
    '/wishlist',
    '/produit',
    '/categorie',
    '/collection',
  ];

  // Liste des pages où masquer wishlist et panier
  const hideEcommercePages = [
    '/inscription',
    '/connexion',
    '/admin',
  ];
  const hideEcommerce = hideEcommercePages.some(page => pathname.startsWith(page));
  const forceTerraCotta = terraCottaPages.some(page => pathname.startsWith(page));

  // Vérifier si on est dans l'admin
  const isAdminPage = pathname.startsWith('/admin');
  // Vérifier si on est dans le compte
  const isAccountPage = pathname.startsWith('/compte');
  // Vérifier si on est dans le panier
  const isCartPage = pathname.startsWith('/panier');
  // Vérifier si on est sur la page de confirmation
  const isConfirmationPage = pathname.startsWith('/confirmation');

  // Pages où le texte de navigation doit être blanc
  const whiteNavPages = ['/connexion', '/inscription', '/collections'];
  const forceWhiteNav = whiteNavPages.some(page => pathname.startsWith(page));

  // Logique pour le header blanc avant scroll, noir après
  // Forcer le texte noir sur les pages compte, panier et confirmation
  const shouldShowWhiteHeader = (!isScrolled && !forceTerraCotta && !isAdminPage && !isAccountPage && !isCartPage && !isConfirmationPage) || (pathname === '/collections' && !isScrolled);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Catégories', href: '#', onClick: () => setCategorySidebarOpen(true) },
    { name: 'Collections', href: '/collections' },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getAccountLink = () => {
    if (!user) return '/compte';
    return user.active_role === 'admin' ? '/admin' : '/compte';
  };

  const getAccountLabel = () => {
    if (!user) return 'Mon compte';
    return user.active_role === 'admin' ? 'Administration' : 'Mon compte';
  };

  return (
    <>
      <header className={cn(
        "fixed w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm py-3"
          : "bg-transparent py-5"
      )}>
        <div className="container-custom flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center h-14 w-auto" style={{ minWidth: 56 }}>
            <Image
              src="/CACTAIA%20LOGO_CACTAIA%20LOGO%20TERRA-07.png"
              alt="Cactaia Bijoux Logo"
              width={56}
              height={56}
              priority
              className={cn(
                "transition-all duration-300 h-14 w-auto",
                shouldShowWhiteHeader
                  ? "filter brightness-0 saturate-100 invert"
                  : "filter-none"
              )}
            />
          </Link>

          {/* Desktop Navigation - Next to logo */}
          <nav className="hidden md:flex items-center space-x-6 ml-6">
            {navLinks.map((link) => (
              link.onClick ? (
                <button
                  key={link.name}
                  onClick={link.onClick}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    shouldShowWhiteHeader
                      ? "text-white hover:text-primary/80"
                      : "text-black hover:text-primary/80"
                  )}
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    shouldShowWhiteHeader
                      ? "text-white hover:text-primary/80"
                      : "text-black hover:text-primary/80"
                  )}
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          {/* Site Name - Center */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <Image
              src="/menu-logo.png"
              alt="Cactaia Bijoux Logo"
              width={200}
              height={200}
              priority
              className={cn(
                "transition-all duration-300 h-20 w-auto",
                shouldShowWhiteHeader
                  ? "filter brightness-0 saturate-100 invert"
                  : "filter-none"
              )}
            />
          </div>

          {/* Header Icons */}
          <div className="flex items-center space-x-4">
            {!hideEcommerce && (
              <button className={cn(
                "hidden md:flex items-center text-sm transition-colors",
                shouldShowWhiteHeader
                  ? "text-white hover:text-primary/80"
                  : "text-black hover:text-primary/80"
              )}>
                <Search className={cn("h-4 w-4 mr-1", shouldShowWhiteHeader ? "text-white" : "text-black")} />
                <span className="sr-only md:not-sr-only">Recherche</span>
              </button>
            )}

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link href={getAccountLink()} className={cn(
                  "flex items-center text-sm transition-colors",
                  shouldShowWhiteHeader
                    ? "text-white hover:text-primary/80"
                    : "text-black hover:text-primary/80"
                )}>
                  <User className={cn("h-4 w-4 mr-1", shouldShowWhiteHeader ? "text-white" : "text-black")} />
                  <span>{displayName}</span>
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                {pathname !== '/connexion' && (
                  <Link href="/connexion" className={cn(
                    "btn text-sm px-4 py-1 transition-colors",
                    pathname === '/inscription'
                      ? "bg-primary text-white hover:bg-primary/90 border border-primary"
                      : shouldShowWhiteHeader
                        ? "text-white hover:text-primary/80"
                        : "text-black hover:text-primary/80"
                  )}>
                    Connexion
                  </Link>
                )}
                {pathname !== '/inscription' && (
                  <Link href="/inscription" className={cn(
                    "btn text-sm px-4 py-1 transition-colors",
                    pathname === '/connexion'
                      ? "bg-primary text-white hover:bg-primary/90 border border-primary"
                      : shouldShowWhiteHeader
                        ? "bg-white text-primary hover:bg-white/80 border border-white"
                        : "bg-primary text-white hover:bg-primary/90 border border-primary"
                  )}>
                    Inscription
                  </Link>
                )}
              </div>
            )}

            {!hideEcommerce && (
              <>
                <Link href="/wishlist" className={cn(
                  "relative flex items-center text-sm transition-colors",
                  shouldShowWhiteHeader
                    ? "text-white hover:text-primary/80"
                    : "text-black hover:text-primary/80"
                )}>
                  <Heart className={cn("h-4 w-4", shouldShowWhiteHeader ? "text-white" : "text-black")} />
                  {mounted && wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                  <span className="sr-only">Wishlist</span>
                </Link>

                {/* Cart Button */}
                <button
                  onClick={toggleCart}
                  className={cn(
                    "relative flex items-center text-sm transition-colors",
                    shouldShowWhiteHeader
                      ? "text-white hover:text-primary/80"
                      : "text-black hover:text-primary/80"
                  )}
                >
                  <ShoppingBag className={cn("h-4 w-4", shouldShowWhiteHeader ? "text-white" : "text-black")} />
                  {mounted && totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                  <span className="sr-only">Panier</span>
                </button>
              </>
            )}

            {/* Notifications pour les admins */}
            {isAuthenticated && user?.active_role === 'admin' && (
              <NotificationsPanel />
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "md:hidden flex items-center transition-colors",
                shouldShowWhiteHeader
                  ? "text-white hover:text-primary/80"
                  : "text-black hover:text-primary/80"
              )}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className={cn("h-5 w-5", shouldShowWhiteHeader ? "text-white" : "text-black")} />
              ) : (
                <Menu className={cn("h-5 w-5", shouldShowWhiteHeader ? "text-white" : "text-black")} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 z-40 mobile-menu-modern"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header du menu mobile avec logo et croix */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm mobile-menu-header">
              {/* Logo centré */}
              <div className="flex-1" />
              <div className="flex items-center justify-center flex-1 mobile-menu-logo">
                <Image
                  src="/menu-logo.png"
                  alt="Cactaia Bijoux"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
              </div>

              {/* Bouton fermer */}
              <div className="flex-1 flex justify-end">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 mobile-close-btn"
                  aria-label="Fermer le menu"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Contenu du menu */}
            <div className="flex-1 overflow-y-auto px-6 py-8 mobile-menu-scroll bg-white">
              {/* Navigation principale */}
              <nav className="space-y-2 mb-8">
                {navLinks.map((link) => (
                  link.onClick ? (
                    <button
                      key={link.name}
                      onClick={() => {
                        link.onClick();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl text-lg font-medium text-gray-800 hover:text-primary hover:bg-white/60 transition-all duration-200 flex items-center justify-between group mobile-menu-item"
                    >
                      <span>{link.name}</span>
                      <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-primary transition-colors duration-200 nav-indicator" />
                    </button>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block px-4 py-3 rounded-xl text-lg font-medium text-gray-800 hover:text-primary hover:bg-white/60 transition-all duration-200 flex items-center justify-between group mobile-menu-item"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{link.name}</span>
                      <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-primary transition-colors duration-200 nav-indicator" />
                    </Link>
                  )
                ))}
              </nav>

              {/* Séparateur */}
              <div className="gradient-separator" />

              {/* Section authentification */}
              {isAuthenticated ? (
                <div className="space-y-2 mb-8">
                  <Link
                    href={getAccountLink()}
                    className="block px-4 py-3 rounded-xl text-lg font-medium text-gray-800 hover:text-primary hover:bg-white/60 transition-all duration-200 flex items-center justify-between group mobile-menu-item"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{getAccountLabel()}</span>
                    <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-primary transition-colors duration-200 nav-indicator" />
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 rounded-xl text-lg font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 flex items-center justify-between group mobile-menu-item"
                  >
                    <span>Déconnexion</span>
                    <div className="w-2 h-2 rounded-full bg-red-300 group-hover:bg-red-500 transition-colors duration-200 nav-indicator" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mb-8">
                  <Link
                    href="/connexion"
                    className="block px-4 py-3 rounded-xl text-lg font-medium text-gray-800 hover:text-primary hover:bg-white/60 transition-all duration-200 flex items-center justify-between group mobile-menu-item"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Connexion</span>
                    <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-primary transition-colors duration-200 nav-indicator" />
                  </Link>

                  <Link
                    href="/inscription"
                    className="btn btn-primary px-6 py-3 rounded-xl text-lg font-medium text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              )}

              {/* Séparateur */}
              <div className="gradient-separator" />

              {/* Footer */}
              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  © 2025 Cactaia Bijoux
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Créations uniques et écoresponsables
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Category Sidebar */}
      <CategorySidebar
        isOpen={categorySidebarOpen}
        onClose={() => setCategorySidebarOpen(false)}
      />
    </>
  );
};

export default Header;