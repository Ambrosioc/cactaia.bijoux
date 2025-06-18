"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, ShoppingBag, Heart, X, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/stores/userStore';
import { RoleSwitcher } from '@/components/ui/role-switcher';
import { createClient } from '@/lib/supabase/client';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, displayName } = useUser();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Boutique', href: '/boutique' },
    { name: 'Collections', href: '/collections' },
    { name: 'À propos', href: '/a-propos' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
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
    <header className={cn(
      "fixed w-full z-50 transition-all duration-300",
      isScrolled 
        ? "bg-white/95 backdrop-blur-sm shadow-sm py-3" 
        : "bg-transparent py-5"
    )}>
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative z-50">
          <h1 className="font-playfair text-2xl font-medium">
            Cactaia<span className="text-primary">.</span>Bijoux
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Header Icons */}
        <div className="flex items-center space-x-4">
          <button className="hidden md:flex items-center text-sm hover:text-primary transition-colors">
            <Search className="h-4 w-4 mr-1" />
            <span className="sr-only md:not-sr-only">Recherche</span>
          </button>
          
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link href={getAccountLink()} className="flex items-center text-sm hover:text-primary transition-colors">
                <User className="h-4 w-4 mr-1" />
                <span>{displayName}</span>
              </Link>
              
              {/* Role Switcher */}
              <RoleSwitcher variant="badge" showLabel={false} />
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/connexion" className="text-sm hover:text-primary transition-colors">
                Connexion
              </Link>
              <Link href="/inscription" className="btn btn-primary text-sm px-4 py-1">
                Inscription
              </Link>
            </div>
          )}
          
          <Link href="/wishlist" className="flex items-center text-sm hover:text-primary transition-colors">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Wishlist</span>
          </Link>
          <Link href="/panier" className="flex items-center text-sm hover:text-primary transition-colors">
            <ShoppingBag className="h-4 w-4" />
            <span className="sr-only">Panier</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="fixed inset-0 bg-white z-40 pt-20 px-4 flex flex-col"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <nav className="flex flex-col space-y-6 py-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link 
                  href={getAccountLink()} 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {getAccountLabel()}
                </Link>
                
                {/* Mobile Role Switcher */}
                <div className="py-2">
                  <RoleSwitcher variant="button" className="w-full justify-center" />
                </div>
                
                <button 
                  onClick={handleSignOut}
                  className="text-lg font-medium text-red-600 hover:text-red-700 transition-colors text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/connexion" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  href="/inscription" 
                  className="text-lg font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </nav>
          <div className="mt-auto pb-8">
            <p className="text-muted-foreground text-sm">
              © 2025 Cactaia.Bijoux
            </p>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;